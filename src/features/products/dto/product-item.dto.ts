import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ProductItemDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  picture: string;

  @Expose()
  @ApiProperty()
  initial_cost: number;

  @Expose()
  @ApiProperty()
  selling_price: number;
}
