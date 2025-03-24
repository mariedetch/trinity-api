import { PaymentMethod } from 'src/features/payments/payment.enum';
import { Command } from '../command.entity';

export class CommandPaidEvent {
  command: Command;
  method: PaymentMethod;
}
