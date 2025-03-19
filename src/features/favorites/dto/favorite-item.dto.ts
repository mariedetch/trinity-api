import { ApiProperty } from '@nestjs/swagger';

export class FavoriteProductDto {
    @ApiProperty()
    product_id: string; 

    @ApiProperty()
    name: string;
    
    @ApiProperty()
    picture: string;

    @ApiProperty()
    selling_price: number;
}

export class FavoritesResponseDto {
    products: FavoriteProductDto[];
}