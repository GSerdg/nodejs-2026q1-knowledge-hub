import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { getWinstonConfig } from './common/logger/logger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const port = process.env.PORT || 4000;
  const winstonLogger = WinstonModule.createLogger(getWinstonConfig());

  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  const config = new DocumentBuilder()
    .setTitle('Knowledge Hub API')
    .setDescription(
      'Task is to create a REST API for a Knowledge Hub platform using the Nest.js framework. The Knowledge Hub allows users to create, edit, and organize articles by categories and tags.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
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

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );

  process.on('uncaughtException', (err) => {
    winstonLogger.error('Uncaught Exception', err.stack);
    app.close().then(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason, promise) => {
    winstonLogger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    app.close().then(() => process.exit(1));
  });
}

bootstrap();
