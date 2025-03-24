import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsUUID, IsInt, Min, IsNumber } from 'class-validator';

@Exclude()
export class CreateCartItemDto {
  @Expose()
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @Expose()
  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}

@Exclude()
export class UpdateCartItemDto {
  @Expose()
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
