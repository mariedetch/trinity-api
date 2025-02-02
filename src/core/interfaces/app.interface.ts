export interface PriceJsonItem {
  start_time: Date;
  end_time?: Date | undefined;
  initial_cost: number;
  selling_price: number;
  status: boolean;
}

export interface CommandMetaData {
  paid_at: Date | undefined,
  validated_at: Date | undefined,
  shipped_at: Date | undefined,
  delivered_at: Date | undefined,
}

export interface Addresse {
  country: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
}