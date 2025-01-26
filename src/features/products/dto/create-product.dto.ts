import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  Length,
  IsArray,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../enums/category.enum';

export class CreateProductDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Le code barre est requis' })
  @ApiProperty()
  bar_code: number;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @Length(1, 100, { message: 'Le nom doit faire entre 1 et 100 caractères' })
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La catégorie est requise' })
  @Length(1, 30, {
    message: 'La catégorie doit faire entre 1 et 30 caractères',
  })
  @ApiProperty()
  category: string;

  @IsNotEmpty({ message: 'Les nutriments sont requis' })
  @ApiProperty()
  nutriments: any;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'La liste des ingrédients est requise' })
  @ApiProperty()
  ingredients: string[];

  @IsString()
  @IsUrl({}, { message: "L'URL de l'image n'est pas valide" })
  @IsNotEmpty({ message: "L'image est requise" })
  @ApiProperty()
  picture: string;

  @IsNumber()
  @Min(0, { message: 'Le coût initial doit être supérieur ou égal à 0' })
  @IsNotEmpty({ message: 'Le coût initial est requis' })
  @ApiProperty()
  initial_cost: number;

  @IsNumber()
  @Min(0, { message: 'Le prix de vente doit être supérieur ou égal à 0' })
  @IsNotEmpty({ message: 'Le prix de vente est requis' })
  @ApiProperty()
  selling_price: number;

  @IsOptional()
  @ApiProperty()
  prices?: any;

  @IsNumber()
  @Min(0, { message: 'La quantité en stock doit être supérieure ou égale à 0' })
  @IsOptional()
  @ApiProperty()
  quantity_in_stock?: number = 1000;

  @IsNumber()
  @Min(0, { message: "Le seuil d'alerte doit être supérieur ou égal à 0" })
  @IsOptional()
  @ApiProperty()
  alert_threshold?: number = 50;
}
