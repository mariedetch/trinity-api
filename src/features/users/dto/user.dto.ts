import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';
import { Exclude, Expose } from 'class-transformer';

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
  @ApiProperty()
  password: string;

  @Expose()
  @ApiProperty({
    type: [Object],
  })
  paymentMethods: {
    card_number: string;
    expiry_date: string;
    name_on_card: string;
    security_code: string;
  }[];

  @Expose()
  @ApiProperty({
    type: [Object],
  })
  addresses: {
    full_name: string;
    country: string;
    address: string;
    city: string;
    lot: string;
  }[];
}
