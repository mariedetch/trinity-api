import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
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

  @Column({ type: 'float', default: 0 })
  unit_price_incl: number;

  @Column({ type: 'float', default: 0 })
  unit_price_excl: number;

  @Column({ type: 'float', default: 0 })
  total_price_incl: number;

  @Column({ type: 'float', default: 0 })
  total_price_excl: number;

  @ManyToOne(() => Command, (command) => command.command_products)
  @JoinColumn({ name: 'command_id' }) // Nom explicite de la colonne
  command: Command;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
