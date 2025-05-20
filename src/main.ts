import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import settings from './settings';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(settings().corsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.use(
    '/',
    csurf({
      cookie: { key: 'csrftoken' },
      ignoreMethods: [
        'GET',
        'HEAD',
        'OPTIONS',
        'DELETE',
        'PATCH',
        'PUT',
        'POST',
      ],
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Event Server')
    .setDescription('Event Server')
    .setVersion('1.0')
    .addServer('http://localhost:3001/', 'Local environment')
    .addBearerAuth()
    .addTag('Your API Tag')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3001);
}
bootstrap();
