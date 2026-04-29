import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './services/gemini.service';
import { AiController } from './ai.controller';
import { ArticleModule } from 'src/article/article.module';
import { UsageTrackerService } from './services/usage-tracker.service';

@Module({
  imports: [
    HttpModule.register({ timeout: 30000, maxRedirects: 5 }),
    ConfigModule,
    ArticleModule,
  ],
  controllers: [AiController],
  providers: [GeminiService, UsageTrackerService],
  exports: [GeminiService],
})
export class AiModule {}
