// This is a singleton pattern for the Prisma client. It ensures that only one instance of the Prisma client is created and used throughout the application. This is important for performance and to avoid connection issues with the database. The client is created only once and reused in development mode, while in production mode, a new instance is created for each request.
// This is done to avoid issues with hot reloading in development mode, where multiple instances of the Prisma client can be created and lead to connection issues with the database. By using a singleton pattern, we ensure that only one instance of the Prisma client is created and used throughout the application.

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type prismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: prismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
