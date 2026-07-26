import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const productsRouter = Router();

function serialize(p: {
  colors: string;
  sizes?: string;
  variants?: { color: string; size: string | null; stock: number }[];
  [k: string]: unknown;
}) {
  return {
    ...p,
    colors: JSON.parse(p.colors),
    sizes: p.sizes ? JSON.parse(p.sizes) : [],
    variants: p.variants ?? [],
  };
}

productsRouter.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query['category'] === 'string' ? req.query['category'] : undefined;
    const products = await prisma.product.findMany({
      where: category && category !== 'all' ? { category } : undefined,
      orderBy: { id: 'asc' },
      include: { variants: true },
    });
    res.json(products.map(serialize));
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
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

// One row per color (size null for sizeless products) or per color+size
// combo — this is the real per-piece stock count that replaces the old
// blanket "In Stock: yes/no" checkbox.
const variantSchema = z.object({
  color: z.string(),
  size: z.string().nullable().optional(),
  stock: z.number().int().nonnegative(),
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
  sizes: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
});

productsRouter.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const { variants, ...rest } = body;
    const product = await prisma.product.create({
      data: {
        ...rest,
        colors: JSON.stringify(body.colors),
        sizes: JSON.stringify(body.sizes),
        variants: { create: variants.map((v) => ({ color: v.color, size: v.size ?? null, stock: v.stock })) },
      },
      include: { variants: true },
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
    const { variants, ...rest } = body;
    const data: Record<string, unknown> = { ...rest };
    if (body.colors) data['colors'] = JSON.stringify(body.colors);
    if (body.sizes) data['sizes'] = JSON.stringify(body.sizes);

    // Variants aren't identified by stable IDs from the admin form (the
    // color/size grid is rebuilt from scratch each save), so the simplest
    // correct approach is: replace the whole set in one transaction.
    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({
          data: variants.map((v) => ({ productId: id, color: v.color, size: v.size ?? null, stock: v.stock })),
        });
      }
      return tx.product.findUnique({ where: { id }, include: { variants: true } });
    });

    res.json(serialize(updated!));
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
