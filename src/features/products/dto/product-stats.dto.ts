import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductStatsDto {
  @Expose()
  @ApiProperty()
  total_product: number;

  @Expose()
  @ApiProperty()
  available_products: number;

  @Expose()
  @ApiProperty()
  products_out_of_stock: number;

  @Expose()
  @ApiProperty()
  soon_to_be_out_of_stock: number;
}
