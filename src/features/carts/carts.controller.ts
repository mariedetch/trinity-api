import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Put,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Request } from 'express';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { CartItem, CartResponseDto } from './dto/cart-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller({ path: 'carts', version: '1' })
@ApiTags('carts')
@UseGuards(AuthGuard) // il s'applique à toutes les routes de ce fichier
@ApiBearerAuth('access-token')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart(
    @Req() request: Request,
  ): Promise<JsonResponse<CartResponseDto>> {
    const userId = request['user'].sub;
    return this.cartsService.getCart(userId);
  }

  @Post('add')
  async addToCart(
    @Req() request: Request,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<JsonResponse<CartItem>> {
    const userId = request['user'].sub;
    return await this.cartsService.addToCart(userId, addToCartDto);
  }

  @Put('validate')
  async validateCart(
    @Req() request: Request,
  ): Promise<JsonResponse<CartResponseDto>> {
    const userId = request['user'].sub;
    return await this.cartsService.validateCart(userId);
  }

  @Put('item/:id')
  async updateCartItem(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) commandProductId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<JsonResponse<CartItem>> {
    const userId = request['user'].sub;
    return this.cartsService.updateCartItem(
      userId,
      commandProductId,
      updateCartItemDto,
    );
  }

  @Delete('item/:id')
  async removeCartItem(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) commandProductId: string,
  ): Promise<JsonResponse<void>> {
    const userId = request['user'].sub;
    return this.cartsService.removeCartItem(userId, commandProductId);
  }
}
