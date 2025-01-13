import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsObject, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateCommandProductDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCommandDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty({ type: [CreateCommandProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommandProductDto)
  products: CreateCommandProductDto[];

  @ApiProperty()
  @IsObject()
  shipping_address: any;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  shipping_charge: number;
}