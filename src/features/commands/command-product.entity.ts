import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Command } from './command.entity';
import { Product } from '../products/product.entity';

@Entity('command_products')
@Unique(['command_id', 'product_id'])
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

  validate() {
    this.unit_price_excl = this.product.selling_price;
    this.unit_price_incl = parseFloat((this.product.selling_price * 1.8).toFixed(2));
    this.total_price_excl = parseFloat((this.unit_price_excl * this.quantity).toFixed(2));
    this.total_price_incl = parseFloat((this.unit_price_incl * this.quantity).toFixed(2));
  }
}
