import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  HttpStatus,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TypeOrmexceptionFilter } from './common/exceptions/filters/type-orm-exception.filter';
import { HttpExceptionFilter } from './common/exceptions/filters/http-exception.filter';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import session from 'express-session';
import { doubleCsrf } from 'csrf-csrf';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(new TypeOrmexceptionFilter(), new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      validationError: {
        target: true,
        value: true,
      },
    }),
  );
  app.use(helmet());

  const {
    invalidCsrfTokenError,
    doubleCsrfProtection,
    validateRequest,
    generateToken,
  } = doubleCsrf({
    getSecret: () => configService.get<string>('CSRF_SECRET'),
    cookieName: '__Host-psifi.x-csrf-token',
    cookieOptions: {
      sameSite: 'lax',
      path: '/',
      secure: true,
    },
  });

  app.use(doubleCsrfProtection);
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.csrfToken = () => generateToken(req, res);
    next();
  });
  configOpenApiDoc(app);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(3000);
}

export function configOpenApiDoc(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Trinity API')
    .setDescription('Trinity API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

bootstrap();
