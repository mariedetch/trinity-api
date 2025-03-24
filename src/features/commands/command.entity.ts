import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { CommandProduct } from './command-product.entity';
import { CommandStatus } from './enums';
import { User } from '../users/user.entity';
import { Addresse, CommandMetaData } from 'src/core/interfaces/app.interface';
import { v4 as uuidv4 } from 'uuid';

@Entity('commands')
export class Command extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar' })
  reference: string;

  @Column({ type: 'float', default: 0, nullable: true })
  total_price_incl: number;

  @Column({ type: 'float', default: 0, nullable: true })
  total_price_excl: number;

  @Column({ type: 'json', nullable: true })
  shipping_address: Addresse;

  @Column({ type: 'float', default: 0, nullable: true })
  shipping_charge: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    array: false,
    default: () => "'{}'",
  })
  meta_data: CommandMetaData;

  @Column({
    type: 'enum',
    enum: CommandStatus,
    default: CommandStatus.INITIATED,
  })
  status: CommandStatus;

  @OneToMany(() => CommandProduct, (commandProduct) => commandProduct.command)
  command_products: CommandProduct[];

  // Ajout de la relation vers User
  @ManyToOne(() => User, (user) => user.commands)
  @JoinColumn({ name: 'user_id' }) // Associe explicitement user_id comme clé étrangère
  user: User;

  canTransitTo(status: CommandStatus): boolean {
    return (
      (this.status === CommandStatus.PAID &&
        status === CommandStatus.IN_PROGRESS) ||
      (this.status === CommandStatus.IN_PROGRESS &&
        status === CommandStatus.SHIPPED) ||
      (this.status === CommandStatus.SHIPPED &&
        status === CommandStatus.DELIVERED)
    );
  }

  setMetaData(status: CommandStatus): void {
    if (status === CommandStatus.IN_PROGRESS) {
      this.meta_data.validated_at = new Date();
    } else if (status === CommandStatus.SHIPPED) {
      this.meta_data.shipped_at = new Date();
    } else if (status === CommandStatus.DELIVERED) {
      this.meta_data.delivered_at = new Date();
    }
  }
}
