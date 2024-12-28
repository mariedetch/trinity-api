import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethod {
  @IsString()
  @ApiProperty({ example: '1234567812345678', description: 'Card number' })
  card_number: string;

  @IsString()
  @ApiProperty({ example: '12/25', description: 'Expiry date in MM/YY format' })
  expiry_date: string;

  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'Name on the card' })
  holder_name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(4)
  @ApiProperty({ example: '123', description: 'Card security code (CVV)' })
  security_code: string;
}
