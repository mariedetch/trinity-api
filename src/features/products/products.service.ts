import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AbstractCrudService } from 'src/core/services/abstract-crud.service';
import { Product } from './product.entity';
import { ProductDto } from './dto/product.dto';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from 'src/core/services/crud-service.interface';

@Injectable()
export class ProductsService
  extends AbstractCrudService<
    Product,
    ProductDto,
    CreateProductDto,
    UpdateProductDto
  >
  implements
    CrudService<Product, ProductDto, CreateProductDto, UpdateProductDto>
{
  /**
   * The name of the entity, used for generating dynamic messages and responses.
   */
  entityName: string = 'Product';

  /**
   * Converts an product or a list of products to their corresponding Data Transfer Object (DTO) representation.
   *
   * @param {Product | Product[]} product - The product or list of products to be converted to DTO(s).
   * @returns {any} - The DTO or list of DTOs corresponding to the provided product/products.
   */
  convertToDto(product: Product | Product[]): any {
    return plainToClass(ProductDto, product);
  }

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }
}
