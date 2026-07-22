import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin, optionalAuth, AuthedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const ordersRouter = Router();

const orderItemSchema = z.object({
  productId: z.number().int(),
  nameEn: z.string(),
  nameAr: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
});

const createOrderSchema = z.object({
  paymentMethod: z.enum(['cod', 'vodafone', 'instapay']),
  // Base64 data URL of a transfer screenshot (optional — only relevant for
  // vodafone/instapay). Capped well under the 6mb JSON body limit set in
  // index.ts so a single bad request can't exhaust the request size budget.
  paymentProof: z.string().max(5_000_000).optional(),
  discountCode: z.string().trim().min(1).optional(),
  shippingName: z.string().min(1),
  shippingPhone: z.string().regex(/^01[0-9]{9}$/),
  shippingGovernorate: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingStreet: z.string().min(1),
  shippingBuilding: z.string().min(1),
  shippingFloor: z.string().min(1),
  shippingApartment: z.string().min(1),
  shippingLandmark: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

async function resolveDiscount(code: string | undefined, subtotal: number) {
  if (!code) return { discountCode: null as string | null, discountAmount: 0 };
  const found = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!found || !found.active) throw new ApiError(400, 'Invalid or expired discount code');
  if (found.expiresAt && found.expiresAt < new Date()) throw new ApiError(400, 'This discount code has expired');
  if (found.maxUses != null && found.usedCount >= found.maxUses) {
    throw new ApiError(400, 'This discount code has reached its usage limit');
  }
  const discountAmount = Math.round(subtotal * (found.percent / 100));
  return { discountCode: found.code, discountAmount, discountId: found.id };
}

// requireAuth was replaced with optionalAuth so orders can be placed without
// an account (guest checkout) — a logged-in user's orders still link to
// their account when a valid token is sent.
ordersRouter.post('/', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const subtotal = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = await resolveDiscount(body.discountCode, subtotal);
    const deposit = Math.ceil((subtotal - discount.discountAmount) * 0.2);

    const order = await prisma.order.create({
      data: {
        userId: req.user?.id,
        paymentMethod: body.paymentMethod,
        paymentProof: body.paymentProof,
        subtotal,
        deposit,
        discountCode: discount.discountCode,
        discountAmount: discount.discountAmount,
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingGovernorate: body.shippingGovernorate,
        shippingCity: body.shippingCity,
        shippingStreet: body.shippingStreet,
        shippingBuilding: body.shippingBuilding,
        shippingFloor: body.shippingFloor,
        shippingApartment: body.shippingApartment,
        shippingLandmark: body.shippingLandmark,
        items: { create: body.items.map(({ productId, ...rest }) => ({ ...rest, productId })) },
      },
      include: { items: true },
    });

    if ('discountId' in discount && discount.discountId) {
      await prisma.discountCode.update({ where: { id: discount.discountId }, data: { usedCount: { increment: 1 } } });
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

ordersRouter.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const order = await prisma.order.update({ where: { id: req.params['id'] }, data: { status } });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:id', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params['id'] }, include: { items: true } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      throw new ApiError(403, 'Not your order');
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});
