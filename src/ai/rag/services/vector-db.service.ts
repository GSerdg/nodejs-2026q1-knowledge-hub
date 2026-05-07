import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ServiceUnavailableError } from 'src/common/errors/custom-error';

@Injectable()
export class VectorDbService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collectionName: string;

  constructor(private readonly config: ConfigService) {
    this.client = new QdrantClient({
      url: this.config.getOrThrow('RAG_VECTOR_DB_URL'),
    });
    this.collectionName = this.config.get(
      'RAG_VECTOR_COLLECTION',
      'knowledge_hub_articles',
    );
  }

  async onModuleInit() {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: { size: 3072, distance: 'Cosine' },
        });
      }
    } catch (error) {
      console.error('Failed to connect to Qdrant:', error);
    }
  }

  getCollectionName() {
    return this.collectionName;
  }

  async upsertPoint(point: { id: string; vector: number[]; payload: any }) {
    try {
      await this.client.upsert(this.collectionName, {
        points: [point],
      });
    } catch {
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async search(vector: number[], filter?: any, limit = 5) {
    try {
      return await this.client.search(this.collectionName, {
        vector,
        filter,
        limit,
        with_payload: true,
      });
    } catch {
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async existsByArticleId(articleId: string): Promise<boolean> {
    try {
      const result = await this.client.scroll(this.collectionName, {
        filter: {
          must: [{ key: 'articleId', match: { value: articleId } }],
        },
        limit: 1,
        with_payload: false,
        with_vector: false,
      });
      return result.points.length > 0;
    } catch {
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async deleteByArticleId(articleId: string) {
    try {
      await this.client.delete(this.collectionName, {
        filter: {
          must: [{ key: 'articleId', match: { value: articleId } }],
        },
      });
    } catch {
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }
}
