import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AbstractCrudService } from 'src/core/services/abstract-crud.service';
import { Product } from './product.entity';
import { ProductDto } from './dto/product.dto';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
  DeepPartial,
  ILike,
} from 'typeorm';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { CrudService } from 'src/core/services/crud-service.interface';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { PriceJsonItem } from 'src/core/interfaces/app.interface';
import { ProductStatsDto } from './dto/product-stats.dto';
import { ProductOrderHistoryDto } from './dto/product-orders.dto';
import { SortDirection } from 'src/common/utils/constants';

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

  async create(createDto: CreateProductDto): Promise<JsonResponse<ProductDto>> {
    const price: PriceJsonItem = {
      start_time: new Date(),
      initial_cost: createDto.initial_cost,
      selling_price: createDto.selling_price,
      status: true,
    };

    const entity = this.repository.create(createDto as DeepPartial<Product>);
    entity.prices = [];
    entity.prices.push(price);

    await this.repository.save(entity);

    return successResponse(
      this.convertToDto(entity),
      `${this.entityName} created successfully`,
      201,
    );
  }

  async update(
    id: string,
    updateDto: UpdateProductDto,
  ): Promise<JsonResponse<ProductDto>> {
    const product = await this.repository.findOneByOrFail({ id });

    const productToUpdate = await this.repository.preload({
      id: id,
      ...updateDto,
    } as DeepPartial<Product>);

    if (
      product.selling_price != productToUpdate.selling_price ||
      product.initial_cost != productToUpdate.initial_cost
    ) {
      productToUpdate.prices.forEach((price, index) => {
        if (price.status) {
          price.status = false;
          price.end_time = new Date();
        }
      });

      productToUpdate.prices.push({
        start_time: new Date(),
        initial_cost: productToUpdate.initial_cost,
        selling_price: productToUpdate.selling_price,
        status: true,
      });
    }

    await this.repository.save(productToUpdate);

    return successResponse(
      this.convertToDto(productToUpdate),
      `${this.entityName} updated successfully`,
    );
  }

  /**
   * Retrieves products with pagination and search options.
   *
   * @param {number} page - Current page number.
   * @param {number} perPage - Number of products per page.
   * @param {object} searchOptions - Filters for searching products.
   * @returns {Promise<JsonResponse<PaginationResource<ProductDto>>>}
   */
  async findAllProducts(
    page: number,
    perPage: number,
    sortDir: SortDirection,
    searchOptions: {
      name?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      minQuantity?: number;
      maxQuantity?: number;
    },
  ): Promise<JsonResponse<PaginationResource<ProductDto>>> {
    // Dynamic WHERE clause for search options
    const where: FindOptionsWhere<Product> = {};

    if (searchOptions.name) {
      where.name = ILike(`%${searchOptions.name}%`);
    }
    if (searchOptions.category) {
      where.category = searchOptions.category;
    }
    if (searchOptions.minPrice !== undefined) {
      where.selling_price = MoreThanOrEqual(searchOptions.minPrice);
    }
    if (searchOptions.maxPrice !== undefined) {
      where.selling_price = LessThanOrEqual(searchOptions.maxPrice);
    }
    if (searchOptions.minQuantity !== undefined) {
      where.quantity_in_stock = MoreThanOrEqual(searchOptions.minQuantity);
    }
    if (searchOptions.maxQuantity !== undefined) {
      where.quantity_in_stock = LessThanOrEqual(searchOptions.maxQuantity);
    }

    // Retrieve entities with pagination
    const [entities, total] = await this.productRepository.findAndCount({
      where,
      order: { quantity_in_stock: sortDir },
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
    });

    const result: PaginationResource<ProductDto> = {
      items: this.convertToDto(entities),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(
      result,
      `${this.entityName}s retrieved successfully`,
    );
  }

  // fonction pour avoir les statistiques des produits
  async getProductStats(): Promise<JsonResponse<ProductStatsDto>> {
    const [
      total_product,
      available_products,
      products_out_of_stock,
      soon_to_be_out_of_stock,
    ] = await Promise.all([
      // Compte total des produits
      this.productRepository.count(),

      // Produits disponibles (quantité > seuil d'alerte)
      this.productRepository
        .createQueryBuilder('product')
        .where('product.quantity_in_stock > product.alert_threshold')
        .getCount(),

      // Produits en rupture de stock
      this.productRepository
        .createQueryBuilder('product')
        .where('product.quantity_in_stock = :quantity', { quantity: 0 })
        .getCount(),

      // Produits bientôt en rupture de stock
      this.productRepository
        .createQueryBuilder('product')
        .where('product.quantity_in_stock <= product.alert_threshold')
        .andWhere('product.quantity_in_stock > :quantity', { quantity: 0 })
        .getCount(),
    ]);

    const data = {
      total_product,
      available_products,
      products_out_of_stock,
      soon_to_be_out_of_stock,
    };

    return successResponse(data, 'Products statistics retrieved successfully');
  }

  async getPriceHistory(
    id: string,
  ): Promise<JsonResponse<Array<PriceJsonItem>>> {
    const product = await this.repository.findOneOrFail({
      where: { id },
    });
    // S'assurer que prices est un tableau
    const prices = Array.isArray(product.prices)
      ? product.prices
      : typeof product.prices === 'string'
        ? JSON.parse(product.prices)
        : [];

    // Convertir les dates string en objets Date
    const priceHistory = prices
      .map((price) => ({
        ...price,
        start_time: new Date(price.start_time),
        end_time: price.end_time ? new Date(price.end_time) : undefined,
      }))
      .sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
      .slice(0, 10);

    return successResponse(
      priceHistory,
      'Product price history retrieved successfully',
    );
  }

  // fonction pour récuper les dix derniers commandes d'un produit
  async getOrderHistory(
    id: string,
  ): Promise<JsonResponse<Array<ProductOrderHistoryDto>>> {
    const orderHistory = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin('command_products', 'cp', 'cp.product_id = product.id')
      .innerJoin('commands', 'c', 'c.id = cp.command_id')
      .where('product.id = :id', { id })
      .select([
        'c.user_id as user_id',
        'c.created_at as created_at',
        'cp.quantity as quantity',
        'c.status as status',
      ])
      .orderBy('c.created_at', 'DESC')
      .limit(10)
      .getRawMany();

    const formattedHistory = orderHistory
      .filter((order) => order.user_id !== null) // Added filter as additional safety
      .map((order) => ({
        user_id: order.user_id,
        created_at: new Date(order.created_at),
        quantity: Number(order.quantity),
        status: order.status,
      }));

    return successResponse(
      formattedHistory,
      'Product order history retrieved successfully',
    );
  }
}
