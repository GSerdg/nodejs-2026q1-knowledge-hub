import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { RagController } from './rag.controller';
import { RagService } from './services/rag.service';
import { GoogleAiService } from './services/google-ai.service';
import { VectorDbService } from './services/vector-db.service';
import { ChunkingService } from './services/chunking.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [RagController],
  providers: [RagService, GoogleAiService, VectorDbService, ChunkingService],
  exports: [RagService],
})
export class RagModule {}
