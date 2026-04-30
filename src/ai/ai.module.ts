import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeminiService } from './services/gemini.service';
import { AiController } from './ai.controller';
import { ArticleModule } from 'src/article/article.module';
import { UsageTrackerService } from './services/usage-tracker.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { limit: config.get<number>('AI_RATE_LIMIT_RPM', 15), ttl: 60000 },
      ],
    }),
    HttpModule.register({ timeout: 30000, maxRedirects: 5 }),
    ArticleModule,
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [GeminiService, UsageTrackerService],
  exports: [GeminiService],
})
export class AiModule {}
