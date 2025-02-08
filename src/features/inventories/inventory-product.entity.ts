import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { Product } from 'src/features/products/product.entity';
import { Inventory } from './inventory.entity';

@Entity('inventory_products')
export class InventoryProduct extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  inventory_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  real_quantity: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.inventory_products)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
