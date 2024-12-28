import { ApiProperty } from '@nestjs/swagger';
import { Type, Expose } from 'class-transformer';
import { UserDto } from '../../../features/users/dto/user.dto';

export class LoginResponseDto {
  @Expose()
  @ApiProperty()
  access_token: string;

  @Expose()
  @ApiProperty()
  csrf_token: string;

  @Expose()
  @ApiProperty()
  token_type: string;

  @Expose()
  @ApiProperty()
  expired_in: number;

  @Expose()
  @Type(() => UserDto)
  @ApiProperty()
  user: UserDto;
}
