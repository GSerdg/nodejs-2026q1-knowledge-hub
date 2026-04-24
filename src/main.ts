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

  const handleFatalError = (message: string, err: any) => {
    winstonLogger.error(message, err instanceof Error ? err.stack : err);

    process.stderr.write(`${message} - Graceful shutdown initiated...\n`);

    setTimeout(() => {
      process.stderr.write('Forced exit by timeout.\n');
      process.exit(1);
    }, 2000);

    app
      .close()
      .then(() => {
        process.stdout.write('App closed successfully.\n');
        process.exit(1);
      })
      .catch(() => {
        process.exit(1);
      });
  };

  process.on('uncaughtException', (err) =>
    handleFatalError('Uncaught Exception', err),
  );
  process.on('unhandledRejection', (reason) =>
    handleFatalError('Unhandled Rejection', reason),
  );

  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}

bootstrap();
