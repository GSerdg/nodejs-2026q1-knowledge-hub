import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

@Injectable()
export class ChunkingService {
  private readonly splitter: RecursiveCharacterTextSplitter;

  constructor(private readonly configService: ConfigService) {
    const chunkSize = this.configService.get<number>('RAG_CHUNK_SIZE', 800);
    const chunkOverlap = this.configService.get<number>(
      'RAG_CHUNK_OVERLAP',
      200,
    );

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
  }

  async splitText(text: string): Promise<string[]> {
    return await this.splitter.splitText(text);
  }
}
