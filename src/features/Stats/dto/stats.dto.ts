export interface MonthlyStatsDto {
  month: string;
  year: number;
  count: number;
}

export interface MonthlyRevenueDto {
  month: string;
  year: number;
  revenue: number;
}

export interface GlobalRevenueDto {
  weekly: {
    start_date: string;
    end_date: string;
    revenue: number;
  };
  monthly: {
    month: string;
    year: number;
    revenue: number;
  };
  yearly: {
    year: number;
    revenue: number;
  };
}

export interface GlobalProfitDto {
  weekly: {
    start_date: string;
    end_date: string;
    profit: number;
  };
  monthly: {
    month: string;
    year: number;
    profit: number;
  };
  yearly: {
    year: number;
    profit: number;
  };
}

export interface CategoryStatsDto {
  category: string;
  total_quantity: number;
}
