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
import {
  CreateCartItemDto,
  UpdateCartItemDto,
} from './dto/create-cart-item.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Request } from 'express';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CartItemDto } from './dto/cart-item.dto';
import { CommandDto } from '../commands/dto/command-detail.dto';

@Controller({ path: 'carts', version: '1' })
@ApiTags('carts')
@UseGuards(AuthGuard) // il s'applique à toutes les routes de ce fichier
@ApiBearerAuth('access-token')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart(@Req() request: Request): Promise<JsonResponse<CartItemDto[]>> {
    const userId = request['user'].sub;
    return this.cartsService.getCart(userId);
  }

  @Post('add')
  async addToCart(
    @Req() request: Request,
    @Body() addToCartDto: CreateCartItemDto,
  ): Promise<JsonResponse<CartItemDto>> {
    const userId = request['user'].sub;
    return await this.cartsService.addToCart(userId, addToCartDto);
  }

  @Put('item/:id/')
  async updateCartItem(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) commandProductId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<JsonResponse<CartItemDto>> {
    const userId = request['user'].sub;
    return this.cartsService.updateCartItem(
      userId,
      commandProductId,
      updateCartItemDto,
    );
  }

  @Put('validate')
  async validateCart(
    @Req() request: Request,
  ): Promise<JsonResponse<CommandDto>> {
    const userId = request['user'].sub;
    return await this.cartsService.validateCart(userId);
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
