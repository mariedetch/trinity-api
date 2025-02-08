import { IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateInventoryDto {
  @ApiProperty()
  @Expose()
  @IsString()
  description: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  start_date: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  end_date: Date;
}
