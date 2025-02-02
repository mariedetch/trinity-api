import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './enums/category.enum';
import { BaseEntity } from '../../core/entities/base.entity';
import { PriceJsonItem } from 'src/core/interfaces/app.interface';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true, nullable: true }) // Colonne unique et limitée à 100 caractères
  bar_code: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30 }) // Colonne limitée à 30 caractères
  category: string;

  @Column({ type: 'json' }) // Colonne qui contient un json
  nutriments: any;

  @Column({
    type: 'jsonb',
    nullable: true,
    array: false,
    default: () => "'[]'",
  }) // Colonne qui contient une liste de string
  ingredients: string[];

  @Column()
  picture: string;

  @Column({ type: 'float' })
  initial_cost: number;

  @Column({ type: 'float' })
  selling_price: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    array: false,
    default: () => "'[]'",
  }) // Colonne qui contient le json de l'historique des prix
  prices: Array<PriceJsonItem>;

  @Column({ type: 'int', default: 1000 })
  quantity_in_stock: number;

  @Column({ type: 'int', default: 50 })
  alert_threshold: number;
}
