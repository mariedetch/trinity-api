import { ApiProperty } from '@nestjs/swagger';

class CustomerDetails {
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

// class ShippingAddressDto {
//   @ApiProperty()
//   country: string;
  
//   @ApiProperty()
//   city: string;
  
//   @ApiProperty()
//   state: string;
  
//   @ApiProperty()
//   postal_code: string;
  
//   @ApiProperty()
//   phone: string;
  
//   @ApiProperty()
//   email: string;
// }

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

export class CommandDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;
  
  @ApiProperty()
  customer: CustomerDetails;
  
  @ApiProperty()
  created_at: string;
  
  @ApiProperty()
  total_price_incl: number;
  
  @ApiProperty()
  total_price_excl: number;
  
  @ApiProperty()
  shipping_charge: number;
  
  @ApiProperty()
  meta_data: MetaData;
  
  @ApiProperty()
  shipping_address: any;
  
  @ApiProperty()
  status: string;
}