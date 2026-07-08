import { PrismaClient } from '@prisma/client';

// Single shared Prisma instance for the whole process (avoids exhausting
// SQLite connections when routes import this repeatedly).
export const prisma = new PrismaClient();
