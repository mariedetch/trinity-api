import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, In, DataSource } from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryProduct } from './inventory-product.entity';
import { Product } from 'src/features/products/product.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { InventoryDto } from './dto/inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { plainToClass } from 'class-transformer';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { ProductDto } from 'src/features/products/dto/product.dto';
import { AbstractCrudService } from 'src/core/services/abstract-crud.service';
import { CrudService } from 'src/core/services/crud-service.interface';

@Injectable()
export class InventoriesService
  extends AbstractCrudService<
    Inventory,
    InventoryDto,
    CreateInventoryDto,
    UpdateInventoryDto
  >
  implements
    CrudService<Inventory, InventoryDto, CreateInventoryDto, UpdateInventoryDto>
{
  /**
   * The name of the entity, used for generating dynamic messages and responses.
   */
  entityName: string = 'Inventory';

  /**
   * Converts an inventory or a list of supplies to their corresponding Data Transfer Object (DTO) representation.
   *
   * @param {Inventory | Inventory[]} inventory - The inventory or list of supplies to be converted to DTO(s).
   * @returns {any} - The DTO or list of DTOs corresponding to the provided inventory/inventories.
   */
  convertToDto(inventory: Inventory | Inventory[]): any {
    return plainToClass(InventoryDto, inventory);
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
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryProduct)
    private inventoryProductRepository: Repository<InventoryProduct>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {
    super(inventoryRepository);
  }

  /**
   * Creates a new resource based on the provided createDto data.
   *
   * @param createDto The data required to create the new resource.
   * @returns A promise containing the JSON response with the details of the newly created resource.
   */
  async createInventory(
    createInventoryDto: CreateInventoryDto,
  ): Promise<JsonResponse<InventoryDto>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const today = new Date();
      const numeroInventory = parseInt(
        today.getFullYear().toString() +
          (today.getMonth() + 1).toString().padStart(2, '0') +
          today.getDate().toString().padStart(2, '0'),
        10,
      );
      const inventory = queryRunner.manager.create(Inventory, {
        numero: numeroInventory,
        ...(createInventoryDto as DeepPartial<Inventory>),
      });
      await queryRunner.manager.save(inventory);

      const products = await queryRunner.manager.find(Product);

      const inventoryProducts = await Promise.all(
        products.map(async (product) => {
          const inventoryProduct = queryRunner.manager.create(
            InventoryProduct,
            {
              inventory_id: inventory.id,
              product_id: product.id,
              quantity: product.quantity_in_stock,
            },
          );

          return inventoryProduct;
        }),
      );

      await queryRunner.manager.save(inventoryProducts);

      await queryRunner.commitTransaction();

      return successResponse(
        this.convertToDto(inventory),
        `Inventory created successfully`,
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
    const inventoryProducts = await this.inventoryProductRepository.find({
      where: { inventory_id: id },
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
    });

    const productIds = inventoryProducts.map((sp) => sp.product_id);
    const [entities, total] = await this.productRepository.findAndCount({
      where: { id: In(productIds) },
    });
    const result: PaginationResource<ProductDto> = {
      items: this.convertPToDto(entities),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(
      result,
      `Inventory products retrieved successfully`,
      201,
    );
  }

  /**
   * Updates a specific resource based on its identifier and the provided updateDto data.
   *
   * @param id The identifier of the resource to update.
   * @param updateDto The data required to update the resource.
   * @returns A promise containing the JSON response with the details of the updated resource.
   */
  async updateInventory(
    id: string,
    updateDtos: UpdateInventoryDto[],
  ): Promise<JsonResponse<InventoryDto>> {
    const inventoryProducts = await Promise.all(
      updateDtos.map(async (updateDto) => {
        const inventoryProduct = await this.inventoryProductRepository.preload({
          inventory_id: id,
          product_id: updateDto.product_id,
          real_quantity: updateDto.quantity,
        });

        if (!inventoryProduct) {
          throw new NotFoundException(`Product or Inventory not found`);
        }

        return inventoryProduct;
      }),
    );

    await this.inventoryProductRepository.save(inventoryProducts);

    const inventory = await this.inventoryRepository.findOneByOrFail({ id });

    return successResponse(
      this.convertToDto(inventory),
      `Inventory updated successfully`,
    );
  }
}
