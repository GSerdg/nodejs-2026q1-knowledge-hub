import { ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { describe, it, expect } from 'vitest';

describe('ParseUUIDPipe for some id', () => {
  const pipe = new ParseUUIDPipe({ version: '4' });

  it('should allow a valid version 4 UUID', async () => {
    const validUUID = randomUUID();

    const result = await pipe.transform(validUUID, { type: 'param' });

    expect(result).toBe(validUUID);
  });

  it('should throw BadRequestException for an invalid UUID string', async () => {
    const invalidUUID = 'not-a-valid-uuid';

    await expect(
      pipe.transform(invalidUUID, { type: 'param' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for a valid UUID but wrong version (e.g., v1)', async () => {
    // UUID v1 (временной)
    const uuidV1 = 'e15e81d0-ba0f-11ef-93c6-33924f7961b1';

    await expect(pipe.transform(uuidV1, { type: 'param' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
