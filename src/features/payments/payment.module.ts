import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Payment } from './payment.entity';
import { PaymentsController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CommandsModule } from '../commands/commands.module';
import { Command } from '../commands/command.entity';
import { PayPalModule } from 'src/core/aggregators/paypal/paypal.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([Payment, Command]),
    CommandsModule,
    PayPalModule,
  ],
  exports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [PaymentService, JwtService],
})
export class PaymentsModule {}
