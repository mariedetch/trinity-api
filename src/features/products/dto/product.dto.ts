import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../enums/category.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({
    enum: [Category.NOTEBOOK, Category.BOOK, Category.IN_BOX, Category.UNITARY],
  })
  category: Category;

  @Expose()
  @ApiProperty()
  nbPerBatch: number;

  @Expose()
  @ApiProperty()
  currentStock: number;

  @Expose()
  @ApiProperty()
  warningStock: number;

  @Expose()
  @ApiProperty()
  alertStock: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
