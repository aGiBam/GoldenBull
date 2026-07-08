import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthedRequest extends Request {
  user?: { id: string; role: string };
}

/** Requires a valid Bearer token; rejects with 401 otherwise. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/** Requires requireAuth to have run first; rejects with 403 if not admin. */
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
