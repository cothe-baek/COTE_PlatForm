export * from '@prisma/client';
import { PrismaClient } from '@prisma/client';

let client: PrismaClient | undefined;

/** 프로세스당 하나의 PrismaClient를 공유한다. */
export function getPrisma(): PrismaClient {
  if (!client) client = new PrismaClient();
  return client;
}
