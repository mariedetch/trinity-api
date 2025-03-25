import { BaseEntity } from 'src/core/entities/base.entity';
import { Column, Entity, Index} from 'typeorm';

export enum VerificationCodeType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  REGISTRATION = 'REGISTRATION',
}

@Entity('verification_codes')
export class VerificationCodeEntity extends BaseEntity {

  @Column({ length: 255 })
  @Index()
  email: string;

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'enum', enum: VerificationCodeType, default: VerificationCodeType.PASSWORD_RESET})
  type: VerificationCodeType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
