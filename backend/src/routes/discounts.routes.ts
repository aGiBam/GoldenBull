import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';
import { sendEmail, notifyAdmin } from '../utils/email';

export const discountsRouter = Router();

function generatePromoCode(): string {
  // 6 uppercase alphanumeric characters, e.g. "K3F9QZ" — short enough to
  // type at checkout, long enough to not collide in practice.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const subscribeSchema = z.object({ email: z.string().email() });

// Public: newsletter "Subscribe & get 10% off" signup. One real, working
// code per new email address — re-submitting the same email returns their
// existing code instead of erroring, so it's idempotent.
discountsRouter.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = subscribeSchema.parse(req.body);
    const normalized = email.trim().toLowerCase();

    const existing = await prisma.discountCode.findUnique({ where: { ownerEmail: normalized } });
    if (existing) {
      res.json({ code: existing.code, percent: existing.percent, alreadySubscribed: true });
      return;
    }

    let code = generatePromoCode();
    // Extremely unlikely to collide, but guard against it anyway.
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await prisma.discountCode.findUnique({ where: { code } });
      if (!clash) break;
      code = generatePromoCode();
    }

    const created = await prisma.discountCode.create({
      data: { code, percent: 10, ownerEmail: normalized, maxUses: 1 },
    });

    await sendEmail(
      normalized,
      'Your Golden Bull 10% off code',
      `<p>Thanks for subscribing! Use code <strong>${code}</strong> at checkout for 10% off your first order.</p>`
    );
    await notifyAdmin(
      'New newsletter subscriber',
      `<p>${normalized} subscribed and received promo code <strong>${code}</strong>.</p>`
    );

    res.status(201).json({ code: created.code, percent: created.percent, alreadySubscribed: false });
  } catch (err) {
    next(err);
  }
});

const validateSchema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.number().nonnegative(),
});

// Public — checkout calls this to preview the discount before placing the
// order (the order endpoint re-validates it server-side too, so this is
// purely for showing the customer the reduced total up front).
discountsRouter.post('/validate', async (req, res, next) => {
  try {
    const { code, subtotal } = validateSchema.parse(req.body);
    const found = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!found || !found.active) throw new ApiError(404, 'Invalid discount code');
    if (found.expiresAt && found.expiresAt < new Date()) throw new ApiError(400, 'This discount code has expired');
    if (found.maxUses != null && found.usedCount >= found.maxUses) {
      throw new ApiError(400, 'This discount code has reached its usage limit');
    }
    const amount = Math.round(subtotal * (found.percent / 100));
    res.json({ code: found.code, percent: found.percent, amount });
  } catch (err) {
    next(err);
  }
});

// Admin management — list / create / toggle active. Kept minimal (no
// dedicated admin UI page yet); manage codes via these endpoints directly.
discountsRouter.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(codes);
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  code: z.string().trim().min(1),
  percent: z.number().positive().max(100),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().int().positive().optional(),
});

discountsRouter.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const code = await prisma.discountCode.create({
      data: {
        code: body.code.toUpperCase(),
        percent: body.percent,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        maxUses: body.maxUses,
      },
    });
    res.status(201).json(code);
  } catch (err) {
    next(err);
  }
});

const toggleSchema = z.object({ active: z.boolean() });

discountsRouter.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { active } = toggleSchema.parse(req.body);
    const code = await prisma.discountCode.update({
      where: { id: Number(req.params['id']) },
      data: { active },
    });
    res.json(code);
  } catch (err) {
    next(err);
  }
});
