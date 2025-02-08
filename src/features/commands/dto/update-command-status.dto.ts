import { IsEnum, ValidateIf } from 'class-validator';
import { CommandStatus } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateCommandStatusDto {
  @Expose()
  @ApiProperty()
  @IsEnum(CommandStatus)
  new_status: CommandStatus;

  @Expose()
  @ApiProperty()
  @ValidateIf((o) => o.new_status === CommandStatus.IN_PROGRESS)
  shipping_charge: number; // Optionel pour le passage de PAID à IN_PROGRESS
}
