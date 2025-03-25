import { IsString, IsPhoneNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PrimaryGeneratedColumn } from 'typeorm';

export class Addresses {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @ApiProperty({ example: 'Bénin', description: 'Your Country' })
  country: string;

  @IsString()
  @ApiProperty({ example: 'Lot 85 Dakar', description: 'Your Address' })
  address: string;

  @IsString()
  @ApiProperty({ example: 'Cotonou', description: 'Your City' })
  city: string;

  @IsString()
  @ApiProperty({ example: 'California', description: 'Your State' })
  state: string;

  @IsString()
  @ApiProperty({ example: 'BP 123', description: 'Your Postal Code' })
  postal_code: string;

  @IsPhoneNumber('BJ')
  @ApiProperty()
  phone: string;

  @IsEmail()
  @ApiProperty()
  email: string;
}
