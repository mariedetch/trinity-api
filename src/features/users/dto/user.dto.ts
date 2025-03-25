import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum';
import { Exclude, Expose } from 'class-transformer';
import { Type } from 'class-transformer';
import { Addresses } from './addresses.dto';

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  first_name: string;

  @Expose()
  @ApiProperty()
  last_name: string;

  @Expose()
  @ApiProperty({
    enum: [Role.CUSTOMER, Role.MANAGER],
  })
  role: Role;

  @Expose()
  @ApiProperty()
  phonenumber: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({
    type: Addresses,
    isArray: true,
  })
  @Type(() => Addresses)
  addresses: Addresses[];

  @Expose()
  @ApiProperty()
  createdAt?: Date;
}
