import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { InventoryProduct } from './inventory-product.entity';

@Entity('inventories')
export class Inventory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'boolean', default: false })
  validated: boolean;

  @Column({ type: 'date', nullable: true })
  validated_at: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @OneToMany(
    () => InventoryProduct,
    (inventoryProduct) => inventoryProduct.inventory,
  )
  inventory_products: InventoryProduct[];
}
