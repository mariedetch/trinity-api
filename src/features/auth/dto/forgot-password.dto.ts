import { IsEmail, IsNotEmpty,  IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Nouveau mot de passe" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ description: "Confirmation du nouveau mot de passe" })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
