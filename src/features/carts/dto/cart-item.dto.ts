import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";

@Exclude()
export class CartItemDto {
    @Expose()
    @ApiProperty()
    id: string

    @Expose()
    @Type(() => CartProduct)
    @ApiProperty()
    product: any

    @Expose()
    @ApiProperty()
    quantity: number
}

@Exclude()
export class CartProduct {
    @Expose()
    @ApiProperty()
    id: string

    @Expose()
    @ApiProperty()
    name: string

    @Expose()
    @ApiProperty()
    picture: string

    @Expose()
    @ApiProperty()
    selling_price: number
}
