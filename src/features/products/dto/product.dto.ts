import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ProductDto {
  @Expose()
  @ApiProperty()
  id: string; // Identifiant unique du produit

  @Expose()
  @ApiProperty()
  bar_code: number; // Code barre du produit

  @Expose()
  @ApiProperty()
  name: string; // Nom du produit

  @Expose()
  @ApiProperty()
  category: string; // Catégorie du produit

  @Expose()
  @ApiProperty()
  nutriments: any; // Informations sur les nutriments du produit

  @Expose()
  @ApiProperty()
  ingredients: string[]; // Liste des ingrédients du produit

  @Expose()
  @ApiProperty()
  picture: string; // URL de l'image du produit

  @Expose()
  @ApiProperty()
  initial_cost: number; // Coût initial du produit

  @Expose()
  @ApiProperty()
  selling_price: number; // Prix de vente du produit

  @Expose()
  @ApiProperty()
  quantity_in_stock: number; // Quantité actuelle en stock

  @Expose()
  @ApiProperty()
  alert_threshold: number; // Seuil d'alerte du stock

  @Expose()
  @ApiProperty()
  createdAt: Date; // Date de création du produit

  // @Expose()
  // @ApiProperty()
  // updatedAt: Date; // Date de dernière mise à jour
}
