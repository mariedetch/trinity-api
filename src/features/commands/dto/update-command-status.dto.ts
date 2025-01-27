import { IsUUID, IsEnum, ValidateIf, IsNumber } from 'class-validator';
import { CommandStatus } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommandStatusDto {
    @ApiProperty()
    @IsUUID()
    command_id: string;

    @ApiProperty()
    @IsEnum(CommandStatus)
    new_status: CommandStatus;

    @ApiProperty()
    @ValidateIf(o => o.new_status === CommandStatus.IN_PROGRESS)
    shipping_charge: number; // Optionel pour le passage de PAID à IN_PROGRESS
}