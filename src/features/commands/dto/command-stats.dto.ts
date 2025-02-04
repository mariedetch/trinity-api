import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CommandStatsDto {
  @Expose()
  @ApiProperty()
  total_commands: number;

  @Expose()
  @ApiProperty()
  waiting_commands: number;

  @Expose()
  @ApiProperty()
  shipped_commands: number;

  @Expose()
  @ApiProperty()
  delivered_commands: number;
}
