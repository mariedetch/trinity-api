import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InventoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  numero: number;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  validated: boolean;

  @Expose()
  @ApiProperty()
  validated_at: Date;

  @Expose()
  @ApiProperty()
  start_date: Date;

  @Expose()
  @ApiProperty()
  end_date: Date;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
