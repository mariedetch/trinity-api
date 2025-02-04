import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { Product } from 'src/features/products/product.entity';
import { Supply } from './supply.entity';

@Entity('supply_products')
export class SupplyProduct extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  supply_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  old_stock: number;

  @Column({ type: 'int' })
  new_stock: number;

  @ManyToOne(() => Supply, (supply) => supply.supply_products)
  @JoinColumn({ name: 'supply_id' })
  supply: Supply;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
