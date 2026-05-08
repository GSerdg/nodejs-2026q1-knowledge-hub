import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeminiService } from './services/gemini.service';
import { AiController } from './ai.controller';
import { ArticleModule } from 'src/article/article.module';
import { UsageTrackerService } from './services/usage-tracker.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './services/cache.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { limit: config.get<number>('AI_RATE_LIMIT_RPM', 15), ttl: 60000 },
      ],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('AI_CACHE_TTL_SEC', 300),
      }),
    }),
    HttpModule.register({ timeout: 30000, maxRedirects: 5 }),
    ArticleModule,
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [GeminiService, UsageTrackerService, CacheService],
  exports: [GeminiService],
})
export class AiModule {}
