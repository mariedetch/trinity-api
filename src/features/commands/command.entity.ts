import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { CommandProduct } from './command-product.entity';
import { CommandStatus } from './enums';

@Entity('commands')
export class Command extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar' })
  reference: string;

  @Column({ type: 'float', nullable: true })
  total_price_incl: number;

  @Column({ type: 'float', nullable: true })
  total_price_excl: number;

  @Column({ type: 'json', nullable: true })
  shipping_address: any;

  @Column({ type: 'float', nullable: true })
  shipping_charge: number;

  @Column({ type: 'json', nullable: true })
  meta_data: any;

  @Column({
    type: 'enum',
    enum: CommandStatus,
    default: CommandStatus.INITIATED,
  })
  status: CommandStatus;

  @OneToMany(() => CommandProduct, (commandProduct) => commandProduct.command)
  command_products: CommandProduct[];
}
