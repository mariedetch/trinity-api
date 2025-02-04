import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, In, DataSource } from 'typeorm';
import { Supply } from './supply.entity';
import { SupplyProduct } from './supply-product.entity';
import { Product } from 'src/features/products/product.entity';
import { CreateSupplyDto } from './dto/create-supply.dto';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { SupplyDto } from './dto/supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { plainToClass } from 'class-transformer';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { ProductDto } from 'src/features/products/dto/product.dto';
import { AbstractCrudService } from 'src/core/services/abstract-crud.service';
import { CrudService } from 'src/core/services/crud-service.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SuppliesService
  extends AbstractCrudService<
    Supply,
    SupplyDto,
    CreateSupplyDto,
    UpdateSupplyDto
  >
  implements CrudService<Supply, SupplyDto, CreateSupplyDto, UpdateSupplyDto>
{
  /**
   * The name of the entity, used for generating dynamic messages and responses.
   */
  entityName: string = 'Supply';

  /**
   * Converts an supply or a list of supplies to their corresponding Data Transfer Object (DTO) representation.
   *
   * @param {Supply | Supply[]} supply - The supply or list of supplies to be converted to DTO(s).
   * @returns {any} - The DTO or list of DTOs corresponding to the provided supply/supplies.
   */
  convertToDto(supply: Supply | Supply[]): any {
    return plainToClass(SupplyDto, supply);
  }

  /**
   * Converts an product or a list of products to their corresponding Data Transfer Object (DTO) representation.
   *
   * @param {Product | Product[]} product - The product or list of products to be converted to DTO(s).
   * @returns {any} - The DTO or list of DTOs corresponding to the provided product/products.
   */
  convertPToDto(product: Product | Product[]): any {
    return plainToClass(ProductDto, product);
  }

  constructor(
    @InjectRepository(Supply)
    private supplyRepository: Repository<Supply>,
    @InjectRepository(SupplyProduct)
    private supplyProductRepository: Repository<SupplyProduct>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {
    super(supplyRepository);
  }

  /**
   * Creates a new resource based on the provided createDto data.
   *
   * @param createDto The data required to create the new resource.
   * @returns A promise containing the JSON response with the details of the newly created resource.
   */
  async createSupply(
    createSupplyDtos: CreateSupplyDto[],
  ): Promise<JsonResponse<SupplyDto>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const supply = queryRunner.manager.create(Supply, {
        reference: `CMD-${uuidv4}`,
        date: new Date(),
      });
      await queryRunner.manager.save(supply);

      const supplyProducts = await Promise.all(
        createSupplyDtos.map(async (createSupplyDto) => {
          const product = await queryRunner.manager.findOneOrFail(Product, {
            where: { id: createSupplyDto.product_id },
          });

          const supplyProduct = queryRunner.manager.create(SupplyProduct, {
            new_stock: createSupplyDto.quantity + product.quantity_in_stock,
            old_stock: product.quantity_in_stock,
            supply_id: supply.id,
            ...(createSupplyDto as DeepPartial<SupplyProduct>),
          });

          product.quantity_in_stock += createSupplyDto.quantity;
          await queryRunner.manager.save(product);

          return supplyProduct;
        }),
      );

      await queryRunner.manager.save(supplyProducts);

      await queryRunner.commitTransaction();

      return successResponse(
        this.convertToDto(supply),
        `Supply created successfully`,
        201,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retrieves a paginated list of all resources.
   *
   * @param page The page number to retrieve.
   * @param perPage The number of resources per page.
   * @returns A promise containing the JSON response with the paginated list of resources.
   */
  async findAllProduct(
    page: number,
    perPage: number,
    id: string,
  ): Promise<JsonResponse<PaginationResource<ProductDto>>> {
    const supplyProducts = await this.supplyProductRepository.find({
      where: { supply_id: id },
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
    });

    const productIds = supplyProducts.map((sp) => sp.product_id);
    const [entities, total] = await this.productRepository.findAndCount({
      where: { id: In(productIds) },
    });
    const result: PaginationResource<ProductDto> = {
      items: this.convertPToDto(entities),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(result, `Customers retrieved successfully`, 201);
  }
}
