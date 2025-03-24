export interface MonthlyStatsDto {
  month: string;
  year: number;
  orders_count?: number;
  revenue?: number;
}

// Interface pour les statistiques hebdomadaires
export interface WeeklyStatsDto {
  period: string; // ex: "13-19 Feb"
  startDate: string; // Pour référence interne
  endDate: string; // Pour référence interne
  year: number;
  orders_count?: number;
  revenue?: number;
}

export interface GlobalStatsDto {
  weekly: {
    start_date: string;
    end_date: string;
    revenue?: number;
    profit?: number;
    orders_count?: number;
  };
  monthly: {
    month: string;
    year: number;
    revenue?: number;
    profit?: number;
    orders_count?: number;
  };
  yearly: {
    year: number;
    revenue?: number;
    profit?: number;
    orders_count?: number;
  };
}

export interface TopCityStatsDto {
  city: string;
  customer_count: number;
}

export interface CategoryStatsDto {
  category: string;
  total_quantity: number;
}
