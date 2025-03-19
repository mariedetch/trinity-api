import {Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Entity('favorites')
export class Favorite extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('uuid')
  product_id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}