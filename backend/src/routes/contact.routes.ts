import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';
import { notifyAdmin } from '../utils/email';

export const contactRouter = Router();

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(1),
});

// Public: anyone can submit the "Contact Us" form.
contactRouter.post('/', async (req, res, next) => {
  try {
    const body = contactSchema.parse(req.body);
    const created = await prisma.contactMessage.create({
      data: { ...body, email: body.email || null },
    });
    await notifyAdmin(
      'New contact message',
      `<p><strong>${body.firstName} ${body.lastName}</strong> (${body.phone}${body.email ? `, ${body.email}` : ''}) wrote:</p><p>${body.message}</p>`
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Admin only: the messages that feed the admin notification bell.
contactRouter.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

contactRouter.patch('/:id/read', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    const updated = await prisma.contactMessage.update({ where: { id }, data: { read: true } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

contactRouter.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    await prisma.contactMessage.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
