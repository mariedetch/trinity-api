import {
  IsEnum,
  IsPhoneNumber,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role } from '../enum';
import { Addresses } from './addresses.dto';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  last_name: string;

  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({
    enum: [Role.CUSTOMER, Role.MANAGER],
  })
  role: Role;

  @IsPhoneNumber('BJ')
  @IsNotEmpty()
  @ApiProperty()
  phonenumber: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty()
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => Addresses)
  @ApiProperty({
    type: Addresses,
    isArray: true,
  })
  addresses: Addresses[];
}
