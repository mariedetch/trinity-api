import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { JwtService } from '@nestjs/jwt';
import { Product } from '../products/product.entity';
import { Favorite } from './favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Product])],
  controllers: [FavoritesController],
  providers: [FavoritesService, JwtService]
})
export class FavoritesModule {}
