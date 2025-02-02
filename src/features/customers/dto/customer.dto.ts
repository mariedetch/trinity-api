import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { CommandDto } from "src/features/commands/dto/command-detail.dto";
import { UserDto } from "src/features/users/dto/user.dto";

@Exclude()
export class CustomerDto extends UserDto {
  @Expose()
  @Type(() => CommandDto)
  @ApiProperty()
  lastOrder: CommandDto;

  @Expose()
  @ApiProperty()
  avgOrder: number
}