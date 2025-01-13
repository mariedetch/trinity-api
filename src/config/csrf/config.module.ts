import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CsrfConfigService } from './config.service';
import configuration from './configuration';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration], isGlobal: true })],
  providers: [CsrfConfigService],
  exports: [CsrfConfigService],
})
export class CsrfConfigModule {}
