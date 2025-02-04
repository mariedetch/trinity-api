import {
  IsNumber,
  IsArray,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSupplyDto {
  @ApiProperty({
    description: 'The UUID of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'The quantity to supply',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSupplyProductDto {
  @ApiProperty({ type: [CreateSupplyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplyDto)
  products: CreateSupplyDto[];

  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  supply_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  old_quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  new_quantity: number;
}
