import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { ProductItemDto } from "src/features/products/dto/product-item.dto";

@Exclude()
export class CommandProductDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  unit_price_incl: number;

  @ApiProperty()
  @Expose()
  unit_price_excl: number;

  @ApiProperty()
  @Expose()
  total_price_incl: number;

  @ApiProperty()
  @Expose()
  total_price_excl: number;

  @ApiProperty()
  @Expose()
  @Type(() => ProductItemDto)
  product: ProductItemDto
}