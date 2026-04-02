import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Knowledge Hub API')
    .setDescription(
      'Task is to create a REST API for a Knowledge Hub platform using the Nest.js framework. The Knowledge Hub allows users to create, edit, and organize articles by categories and tags.',
    )
    .setVersion('1.0')
    .addTag('user')
    .addTag('article')
    .addTag('category')
    .addTag('comment')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(4000);
}
bootstrap();
