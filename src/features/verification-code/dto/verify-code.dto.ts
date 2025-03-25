import { IsEmail, IsNotEmpty,  IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Code de réinitialisation" })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}