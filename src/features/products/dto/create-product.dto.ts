import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../enums/category.enum';

export class CreateProductDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsEnum(Category)
  @ApiProperty({
    enum: [Category.NOTEBOOK, Category.BOOK, Category.IN_BOX, Category.UNITARY],
  })
  category: Category;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  nbPerBatch: number;

  @IsNumber()
  @ApiProperty()
  currentStock: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  warningStock: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  alertStock: number;
}
