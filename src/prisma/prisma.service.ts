import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const {
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_DB,
      POSTGRES_PORT,
      POSTGRES_HOST,
    } = process.env;

    const isDocker =
      existsSync('/.dockerenv') || process.env.IS_DOCKER === 'true';
    const host = isDocker
      ? POSTGRES_HOST || 'db'
      : POSTGRES_HOST || 'localhost';

    const dbUrl =
      process.env.DATABASE_URL ||
      `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${host}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
