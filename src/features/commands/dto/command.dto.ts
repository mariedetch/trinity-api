import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CommandStatus } from '../enums';

@Exclude()
export class CommandDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  user_id: string;

  @Expose()
  @ApiProperty()
  reference: string;

  @Expose()
  @ApiProperty()
  total_price_incl: number;

  @Expose()
  @ApiProperty()
  total_price_excl: number;

  @Expose()
  @ApiProperty()
  shipping_address: any;

  @Expose()
  @ApiProperty()
  shipping_charge: number;

  @Expose()
  @ApiProperty()
  meta_data: any;

  @Expose()
  @ApiProperty({ enum: CommandStatus })
  status: CommandStatus;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}