import { ApiProperty } from "@nestjs/swagger";

export class CommandProductsDto {
  @ApiProperty()
  command_id: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  meta_data: any;

  @ApiProperty()
  products: {
    commandProduct_id: string;
    id: string;
    name: string;
    picture: string;
    quantity: number;
  }[];
}