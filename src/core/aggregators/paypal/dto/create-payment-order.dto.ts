import { Exclude, Expose } from 'class-transformer';

export enum PaymentOrderIntent {
  CAPTURE = 'CAPTURE',
  AUTHORIZE = 'AUTHORIZE',
}

export interface Payer {
  email_address: string;
  name: string;
  phone: string;
}

export interface PurchaseAmount {
  currency_code: string;
  value: number;
  breakdown: object;
}

export interface PurchaseUnitItem {
  name: string;
  quantity: number;
  image_url: string;
  tax: number;
}

export interface PurchaseUnit {
  reference_id: string;
  custom_id: string;
  amount: PurchaseAmount;
}

export interface OrderResponseLink {
  href: string;
  rel: string;
  method: string;
}

@Exclude()
export class CreatePaymentOrderDto {
  @Expose()
  intent: string;

  @Expose()
  payment_source: any;

  @Expose()
  purchase_units: PurchaseUnit[];
}

@Exclude()
export class CreatePaymentOrderResponse {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  links: OrderResponseLink[];
}
