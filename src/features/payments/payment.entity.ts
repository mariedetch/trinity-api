import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Command } from '../commands/command.entity';
import { User } from '../users/user.entity';
import { PaymentMethod, PaymentStatus } from './payment.enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customer_id: string;

  @Column('uuid')
  command_id: string;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ManyToOne(() => Command)
  @JoinColumn({ name: 'command_id' })
  command: Command;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;
}
