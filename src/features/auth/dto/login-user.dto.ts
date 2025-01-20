import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'john.doe@example.com',
  })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @ApiProperty({
    example: 'Securepassword123',
  })
  password: string;
}
