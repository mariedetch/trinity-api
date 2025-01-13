export interface PriceJsonItem {
    start_time: Date;
    end_time?: Date | undefined;
    initial_cost: number;
    selling_price: number;
    status: boolean;
}

