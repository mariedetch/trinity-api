import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Addresse } from 'src/core/interfaces/app.interface';
import { Addresses } from 'src/features/users/dto/addresses.dto';
import { CommandStatus } from '../enums';

class CustomerDetailDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  firstname: string;
  
  @ApiProperty()
  lastname: string;
  
  @ApiProperty()
  phonenumber: string;
  
  @ApiProperty()
  email: string;
}

class MetaData {
  @ApiProperty()
  paid_at: string;
 
  @ApiProperty()
  validated_at: string;
  
  @ApiProperty()
  shipped_at: string;
  
  @ApiProperty()
  delivered_at: string;
}

export class CommandDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;
  
  @ApiProperty()
  @Type(() => CustomerDetailDto)
  customer: CustomerDetailDto;
  
  @ApiProperty()
  created_at: string;
  
  @ApiProperty()
  total_price_incl: number;
  
  @ApiProperty()
  total_price_excl: number;
  
  @ApiProperty()
  shipping_charge: number;
  
  @ApiProperty()
  @Type(() => MetaData)
  meta_data: MetaData;
  
  @ApiProperty()
  @Type(() => Addresses)
  shipping_address: Addresse;
  
  @ApiProperty()
  status: CommandStatus;
}