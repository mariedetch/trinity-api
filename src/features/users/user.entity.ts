import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { Role } from './enum';
import { BaseEntity } from '../../core/entities/base.entity';
import { Command } from '../commands/command.entity';
import * as bcrypt from 'bcrypt';
import { Addresse } from 'src/core/interfaces/app.interface';

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
  addresses: Addresse[];

  // Relation avec Command
  @OneToMany(() => Command, (command) => command.user)
  commands: Command[];

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }

  getFullName() {
    return this.first_name + ' ' + this.last_name;
  }
}
