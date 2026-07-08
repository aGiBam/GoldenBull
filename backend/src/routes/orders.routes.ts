import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin, AuthedRequest } from '../middleware/auth.middleware';
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
  shippingName: z.string().min(1),
  shippingPhone: z.string().regex(/^01[0-9]{9}$/),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
});

ordersRouter.post('/', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const subtotal = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deposit = Math.ceil(subtotal * 0.2);

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        paymentMethod: body.paymentMethod,
        paymentProof: body.paymentProof,
        subtotal,
        deposit,
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        items: { create: body.items.map(({ productId, ...rest }) => ({ ...rest, productId })) },
      },
      include: { items: true },
    });

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
