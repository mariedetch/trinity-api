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
import { WinstonModule } from 'nest-winston';
import { logger } from './core/logger/winston.logger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
  });

  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');
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
  app.use(
    cookieParser({
      sameSite: 'lax',
      secure: false,
    }),
  );
  app.use(helmet());

  // const { doubleCsrfProtection, generateToken } = doubleCsrf({
  //   getSecret: () => configService.get<string>('CSRF_SECRET'),
  //   cookieName: '__Host-psifi.x-csrf-token',
  //   cookieOptions: {
  //     sameSite: 'lax',
  //     path: '/',
  //     secure: false,
  //   },
  // });
  // app.use((req, res, next) => {
  //   const csrfToken = generateToken(req, res);
  //   req.csrfToken = () => csrfToken;
  //   res.cookie('__Host-psifi.x-csrf-token', csrfToken, {
  //     sameSite: 'lax',
  //     path: '/',
  //     secure: false,
  //   });
  //   next();
  // });
  // app.use((req, res, next) => {
  //   if (req.url === '/auth/login') {
  //     return next();
  //   }
  //   return doubleCsrfProtection(req, res, next);
  // });
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: ['Authorization'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  configOpenApiDoc(app);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(3000);
}

export function configOpenApiDoc(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Trinity API Documentation')
    .setDescription('Trinity API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

bootstrap();
