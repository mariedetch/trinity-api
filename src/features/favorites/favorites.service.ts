import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Product } from '../products/product.entity';
import { JsonResponse, successResponse } from 'src/common/helpers/json-response.helper';
import { FavoriteProductDto, FavoritesResponseDto } from './dto/favorite-item.dto';

@Injectable()
export class FavoritesService {
  constructor(
      @InjectRepository(Favorite)
      private favoriteRepository: Repository<Favorite>,
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
    ) {}

  private convertToDto(favorites: Favorite[]): FavoritesResponseDto {
    return {
      products: favorites.map((favorite) => ({
        product_id: favorite.product_id,
        name: favorite.product.name,
        picture: favorite.product.picture,
        selling_price: favorite.product.selling_price,
      })),
    };
  }

  // Route pour lister les favoris d'un user
  async getUserFavorites(userId: string): Promise<JsonResponse<FavoritesResponseDto>> {
    // Récupérer tous les favoris de l'utilisateur avec les informations des produits
    const favorites = await this.favoriteRepository.find({
      where: { user_id: userId },
      relations: ['product'],
    });
    
    const favoritesDto = this.convertToDto(favorites);
    return successResponse(favoritesDto, 'Favorites retrieved successfully', 200);
  }

  // Route pour ajouter un favori à un user  
  async addToFavorites(userId: string, productId: string): Promise<JsonResponse<FavoriteProductDto>> {
    // Vérifier si le produit existe
    const product = await this.productRepository.findOneOrFail({
      where: { id: productId }
    });

    // Vérifier si le produit est déjà dans les favoris
    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Product already in favorites');
    }

    // Ajouter le produit aux favoris
    await this.favoriteRepository.save({
      user_id: userId,
      product_id: productId,
    });

    const data = {
      product_id: productId,
      name: product.name,
      picture: product.picture,
      selling_price: product.selling_price
    }

    return successResponse(
      data,
      `Product added to favorites successfully`
    );
  }

  // Route pour supprimer un favori à un user 
  async removeFromFavorites(userId: string, productId: string): Promise<JsonResponse<null>> {
    // Vérifier si le favori existe
    const favorite = await this.favoriteRepository.findOneOrFail({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });
  
    // Supprimer le favori
    await this.favoriteRepository.remove(favorite);
  
    return successResponse(
      null,
      'Product removed from favorites successfully'
    );
  }

}


