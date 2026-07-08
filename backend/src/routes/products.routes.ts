import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const productsRouter = Router();

function serialize(p: { colors: string; [k: string]: unknown }) {
  return { ...p, colors: JSON.parse(p.colors) };
}

productsRouter.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query['category'] === 'string' ? req.query['category'] : undefined;
    const products = await prisma.product.findMany({
      where: category && category !== 'all' ? { category } : undefined,
      orderBy: { id: 'asc' },
    });
    res.json(products.map(serialize));
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new ApiError(404, 'Product not found');
    res.json(serialize(product));
  } catch (err) {
    next(err);
  }
});

const colorSchema = z.object({
  name: z.string(),
  nameAr: z.string(),
  hex: z.string(),
  image: z.string().optional(),
});

const productSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  descEn: z.string().min(1),
  descAr: z.string().min(1),
  price: z.number().positive(),
  image: z.string().min(1),
  category: z.enum(['belts', 'wallets', 'cardHolders', 'slippers', 'portefeuille', 'longWallets']),
  inStock: z.boolean().default(true),
  colors: z.array(colorSchema).default([]),
});

productsRouter.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const product = await prisma.product.create({
      data: { ...body, colors: JSON.stringify(body.colors) },
    });
    res.status(201).json(serialize(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    const body = productSchema.partial().parse(req.body);
    const data: Record<string, unknown> = { ...body };
    if (body.colors) data['colors'] = JSON.stringify(body.colors);
    const product = await prisma.product.update({ where: { id }, data });
    res.json(serialize(product));
  } catch (err) {
    next(err);
  }
});

productsRouter.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
