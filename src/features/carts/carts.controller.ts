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
import { CartResponseDto } from './dto/cart-response.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('carts')
@ApiTags('carts')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCart(
    @Req() request: Request,
  ): Promise<JsonResponse<CartResponseDto>> {
    const userId = request['user'].sub;
    return this.cartsService.getCart(userId);
  }

  @Post('add')
  @UseGuards(AuthGuard)
  async addToCart(
    @Req() request: Request,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<JsonResponse<CartResponseDto>> {
    const userId = request['user'].sub;
    return await this.cartsService.addToCart(userId, addToCartDto);
  }

  @Put('item/:id')
  @UseGuards(AuthGuard)
  async updateCartItem(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) commandProductId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<JsonResponse<CartResponseDto>> {
    const userId = request['user'].sub;
    return this.cartsService.updateCartItem(
      userId,
      commandProductId,
      updateCartItemDto,
    );
  }

  @Delete('item/:id')
  @UseGuards(AuthGuard)
  async removeCartItem(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) commandProductId: string,
  ): Promise<JsonResponse<CartResponseDto>> {
    const userId = request['user'].sub;
    return this.cartsService.removeCartItem(userId, commandProductId);
  }
}
