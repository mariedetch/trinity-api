import { Column, Entity } from 'typeorm';
import { Role } from './enums/role.enum';
import { BaseEntity } from '../../../src/core/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ nullable: false, unique: true })
  phonenumber: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ type: 'json', nullable: true })
  payment_methods: {
    card_number: string;
    expiry_date: string;
    holder_name: string;
    security_code: string;
  }[];

  @Column({ type: 'json', nullable: true })
  addresses: {
    country: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
    email: string;
  }[];
}
