import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { RagController } from './rag.controller';
import { RagService } from './services/rag.service';
import { GoogleAiService } from './services/google-ai.service';
import { VectorDbService } from './services/vector-db.service';
import { ChunkingService } from './services/chunking.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('RAG_HISTORY_TTL_SEC', 86400),
      }),
    }),
    ConfigModule,
    PrismaModule,
  ],
  controllers: [RagController],
  providers: [RagService, GoogleAiService, VectorDbService, ChunkingService],
  exports: [RagService],
})
export class RagModule {}
