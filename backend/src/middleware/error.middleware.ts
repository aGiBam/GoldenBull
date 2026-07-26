import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  // Previously fell through to the generic 500 below, which made every
  // ordinary validation failure (bad email format, missing required field,
  // etc.) look like a server crash to the frontend/customer — it's actually
  // a 400 with a specific, useful message.
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const message = first ? `${first.path.join('.')}: ${first.message}` : 'Invalid request data';
    return res.status(400).json({ message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found' });
}
