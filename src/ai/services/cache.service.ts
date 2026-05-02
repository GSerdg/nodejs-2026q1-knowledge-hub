import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private generateKey(
    articleId: string,
    params: any,
    updatedAt: number,
  ): string {
    const rawKey = `${articleId}_${JSON.stringify(params)}_${updatedAt}`;

    return crypto.createHash('md5').update(rawKey).digest('hex');
  }

  async get<T>(
    articleId: string,
    params: any,
    updatedAt: number,
  ): Promise<T | undefined> {
    const key = this.generateKey(articleId, params, updatedAt);

    return await this.cacheManager.get<T>(key);
  }

  async set(
    articleId: string,
    params: any,
    updatedAt: number,
    value: any,
  ): Promise<void> {
    const key = this.generateKey(articleId, params, updatedAt);
    await this.cacheManager.set(key, value);
  }
}
