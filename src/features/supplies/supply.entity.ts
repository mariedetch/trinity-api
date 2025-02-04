import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { SupplyProduct } from './supply-product.entity';

@Entity('supply')
export class Supply extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @OneToMany(() => SupplyProduct, (supplyProduct) => supplyProduct.supply)
  supply_products: SupplyProduct[];
}
