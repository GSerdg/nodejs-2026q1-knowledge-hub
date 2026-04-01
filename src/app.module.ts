import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [UserModule, ArticleModule, DbModule],
})
export class AppModule {}
