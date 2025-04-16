// According to the Prisma documentation, this is the recommended way to use Prisma in a Next.js application.
// This is to ensure that the Prisma Client is only instantiated once in development mode, and it is reused in production mode.
// This prevents the client from being instantiated multiple times in development mode, which can lead to issues with hot reloading and connection limits.
// This is a common pattern used in Next.js applications to manage the Prisma Client instance.

// Hmm, these copilot suggestions for comments are pretty good.  Just what I was going to write.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
