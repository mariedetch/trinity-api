import { IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateInventoryDto {
  @Expose()
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @Expose()
  @ApiProperty()
  @IsNumber()
  quantity: number;
}
