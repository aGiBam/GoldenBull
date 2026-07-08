import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { signToken } from '../utils/jwt';
import { requireAuth, AuthedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toPublicUser(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new ApiError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash, role: 'customer' },
    });

    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid email or password');

    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new ApiError(404, 'User not found');
    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
});

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

authRouter.patch('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: body });
    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
});
