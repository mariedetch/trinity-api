import { Column, Entity } from 'typeorm';
import { Category } from './enums/category.enum';
import { BaseEntity } from 'src/core/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'nb_per_batch', default: 1 })
  nbPerBatch: number;

  @Column({ type: 'enum', enum: Category, default: Category.UNITARY })
  catagory: Category;

  @Column({ name: 'current_stock', default: 0 })
  currentStock: number;

  @Column({ name: 'warning_stock', default: 0 })
  warningStock: number;

  @Column({ name: 'alert_stock', default: 0 })
  alertStock: number;
}
