import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CartItem {
  @Expose()
  @ApiProperty()
  commandProduct_id: string;
  
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
  quantity: number;

  @Expose()
  @ApiProperty()
  selling_price: number;
}


@Exclude()
export class CartResponseDto {
  @Expose()
  @ApiProperty()
  command_id: string;

  @Expose()
  @ApiProperty()
  reference: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  products: CartItem[];

  @Expose()
  @ApiProperty()
  total_price_incl?: number | null;

  @Expose()
  @ApiProperty()
  total_price_excl?: number | null;
}
