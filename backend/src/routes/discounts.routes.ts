import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const discountsRouter = Router();

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
