import { Exclude, Expose, Type } from "class-transformer";
import { PaymentMethod, PaymentStatus } from "../payment.enum";
import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/features/users/dto/user.dto";
import { CommandDto } from "src/features/commands/dto/command-detail.dto";

@Exclude()
export class PaymentDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @Type(() => UserDto)
  @ApiProperty()
  customer: UserDto;

  @Expose()
  @Type(() => CommandDto)
  @ApiProperty()
  command: CommandDto;

  @Expose()
  @ApiProperty()
  amount: number;

  @Expose()
  @ApiProperty()
  payment_method: PaymentMethod;

  @Expose()
  @ApiProperty()
  status: PaymentStatus;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
