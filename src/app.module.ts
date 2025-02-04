import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PostgresDatabaseProviderModule } from './providers/postgres/provider.module';
import { ApiConfigService } from './config/api/config.service';
import { CorsMiddleware } from './common/middlewares/cors.middleware';
import { ApiConfigModule } from './config/api/config.module';
import { FeaturesModule } from './features/features.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtConfigModule } from './config/jwt/config.module';
import { AuthGuard } from './core/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { SuppliesModule } from './features/supplies/supplies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostgresDatabaseProviderModule,
    ApiConfigModule,
    JwtConfigModule,
    FeaturesModule,
    SuppliesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private readonly apiConfigService: ApiConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const { enabled } = this.apiConfigService.cors;
    if (enabled) {
      consumer
        .apply(CorsMiddleware)
        .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
  }
}
