import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { Command } from './command.entity';
import { Product } from '../products/product.entity';

@Entity('command_products')
export class CommandProduct extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  command_id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'float' })
  unit_price_incl: number;

  @Column({ type: 'float' })
  unit_price_excl: number;

  @Column({ type: 'float' })
  total_price_incl: number;

  @Column({ type: 'float' })
  total_price_excl: number;

  @ManyToOne(() => Command, command => command.command_products)
  command: Command;

  @ManyToOne(() => Product)
  product: Product;
}