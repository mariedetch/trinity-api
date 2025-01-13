import { JwtConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import configuration from './configuration';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [configuration], isGlobal: true })],
  providers: [JwtConfigService],
  exports: [JwtConfigService],
})
export class JwtConfigModule {}
