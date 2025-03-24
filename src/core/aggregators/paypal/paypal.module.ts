import { Module } from '@nestjs/common';
import { PayPalAuthService } from './paypal-auth.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiConfigModule } from 'src/config/api/config.module';
import { PayPalService } from './paypal.service';

@Module({
  imports: [ScheduleModule.forRoot(), ApiConfigModule],
  providers: [PayPalAuthService, PayPalService],
  exports: [PayPalAuthService, PayPalService],
})
export class PayPalModule {}
