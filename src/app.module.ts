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
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostgresDatabaseProviderModule,
    ApiConfigModule,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
