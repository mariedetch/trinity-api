import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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

  // @Expose()
  // @ApiProperty()
  // command_products: {
  //   id: string;
  //   product_id: string;
  //   quantity: number;
  // }[];

  @Expose()
  @ApiProperty()
  products: {
    commandProduct_id: string;
    id: string;
    name: string;
    picture: string;
    quantity: number;
  }[];
}
