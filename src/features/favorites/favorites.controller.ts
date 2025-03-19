import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { FavoriteProductDto, FavoritesResponseDto } from './dto/favorite-item.dto';


@Controller({ path: 'favorites', version: '1' })
@ApiTags('favorites')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getUserFavorites(
    @Req() request: Request,
  ): Promise<JsonResponse<FavoritesResponseDto>> {
    const userId = request['user'].sub;
    return this.favoritesService.getUserFavorites(userId);
  }

  @Post('add/:product_id')
  async addToFavorites(
    @Req() request: Request,
    @Param('product_id', ParseUUIDPipe) productId: string,
  ): Promise<JsonResponse<FavoriteProductDto>>  {
    const userId = request['user'].sub;
    return this.favoritesService.addToFavorites(userId, productId);
  }

  @Delete('remove/:product_id')
  async removeFromFavorites(
    @Req() request: Request,
    @Param('product_id', ParseUUIDPipe) productId: string,
  ): Promise<JsonResponse<null>> {
    const userId = request['user'].sub;
    return this.favoritesService.removeFromFavorites(userId, productId);
  }

}
