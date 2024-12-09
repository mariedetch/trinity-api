import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ApiConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration], isGlobal: true })],
  providers: [ApiConfigService],
  exports: [ApiConfigService],
})
export class ApiConfigModule {}
