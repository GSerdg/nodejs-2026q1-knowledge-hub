import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

export const resetPrismaMock = () => {
  vi.clearAllMocks();
};
