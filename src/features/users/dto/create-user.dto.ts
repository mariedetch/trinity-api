import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role } from '../enums/role.enum';

class PaymentMethod {
  @IsString()
  @ApiProperty({ example: '1234567812345678', description: 'Card number' })
  card_number: string;

  @IsString()
  @ApiProperty({ example: '12/25', description: 'Expiry date in MM/YY format' })
  expiry_date: string;

  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'Name on the card' })
  name_on_card: string;

  @IsString()
  @MinLength(3)
  @MaxLength(4)
  @ApiProperty({ example: '123', description: 'Card security code (CVV)' })
  security_code: string;
}

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  first_name: string;

  @IsString()
  @ApiProperty()
  last_name: string;

  @IsEnum(Role)
  @ApiProperty({
    enum: [Role.CUSTOMER, Role.MANAGER],
  })
  role: Role;

  @IsPhoneNumber('BJ')
  @ApiProperty()
  phonenumber: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => PaymentMethod)
  @ApiProperty({
    type: PaymentMethod,
    isArray: true,
    description: 'List of payment methods',
  })
  payment_methods: PaymentMethod[];
}
