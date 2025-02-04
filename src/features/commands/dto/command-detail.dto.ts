import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { Addresse } from 'src/core/interfaces/app.interface';
import { Addresses } from 'src/features/users/dto/addresses.dto';
import { CommandStatus } from '../enums';

@Exclude()
class CustomerDetailDto {
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
  @ApiProperty()
  phonenumber: string;

  @Expose()
  @ApiProperty()
  email: string;
}

@Exclude()
class MetaData {
  @Expose()
  @ApiProperty()
  paid_at: string;

  @Expose()
  @ApiProperty()
  validated_at: string;

  @Expose()
  @ApiProperty()
  shipped_at: string;

  @Expose()
  @ApiProperty()
  delivered_at: string;
}

@Exclude()
export class CommandDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  reference: string;

  @Expose()
  @ApiProperty()
  @Type(() => CustomerDetailDto)
  user: CustomerDetailDto;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  total_price_incl: number;

  @Expose()
  @ApiProperty()
  total_price_excl: number;

  @Expose()
  @ApiProperty()
  shipping_charge: number;

  @Expose()
  @ApiProperty()
  @Type(() => MetaData)
  meta_data: MetaData;

  @Expose()
  @ApiProperty()
  @Type(() => Addresses)
  shipping_address: Addresse;

  @Expose()
  @ApiProperty()
  status: CommandStatus;
}
