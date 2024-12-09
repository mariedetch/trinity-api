import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresConfigService } from './config.service';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [PostgresConfigService],
  exports: [PostgresConfigService],
})
export class PostgresConfigModule {}
