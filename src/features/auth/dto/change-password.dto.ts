import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: "Ancien mot de passe de l'utilisateur" })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: "Nouveau mot de passe de l'utilisateur" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ description: "Confirmation du nouveau mot de passe" })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}