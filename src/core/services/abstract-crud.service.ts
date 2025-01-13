import { DeepPartial, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResource } from '../interfaces/pagination-resource.interface';
import { CrudService } from './crud-service.interface';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';

@Injectable()
export abstract class AbstractCrudService<
  TEntity,
  ReadDto,
  CreateDto,
  UpdateDto,
> implements CrudService<TEntity, ReadDto, CreateDto, UpdateDto>
{
  protected constructor(protected readonly repository: Repository<TEntity>) {}

  /**
   * The name of the entity, used for generating dynamic messages and responses.
   * This abstract property must be defined in the subclass.
   *
   * @type {string}
   * @example
   * export class UserService extends AbstractCrudService<User, UserDto, CreateUserDto, UpdateUserDto> {
   *   entityName = 'User';
   * }
   */
  abstract entityName: string;

  /**
   * Converts an entity or a list of entities to their corresponding Data Transfer Object (DTO) representation.
   * This abstract method must be implemented in the subclass.
   *
   * @param {TEntity | TEntity[]} entity - The entity or list of entities to be converted to DTO(s).
   * @returns {any} - The DTO or list of DTOs corresponding to the provided entity/entities.
   */
  abstract convertToDto(entity: TEntity | TEntity[]): any;

  /**
   * Creates a new resource based on the provided createDto data.
   *
   * @param createDto The data required to create the new resource.
   * @returns A promise containing the JSON response with the details of the newly created resource.
   */
  async create(createDto: CreateDto): Promise<JsonResponse<ReadDto>> {
    const entity = this.repository.create(createDto as DeepPartial<TEntity>);
    await this.repository.save(entity);

    return successResponse(
      this.convertToDto(entity),
      `${this.entityName} created successfully`,
      201,
    );
  }

  /**
   * Retrieves a paginated list of all resources.
   *
   * @param page The page number to retrieve.
   * @param perPage The number of resources per page.
   * @returns A promise containing the JSON response with the paginated list of resources.
   */
  async findAll( page: number, perPage: number): Promise<JsonResponse<PaginationResource<ReadDto>>> 
  {
    const [entities, total] = await this.repository.findAndCount({
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
    });
    const result: PaginationResource<ReadDto> = {
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

  /**
   * Retrieves a specific resource based on its identifier.
   *
   * @param id The identifier of the resource to retrieve.
   * @returns A promise containing the JSON response with the details of the retrieved resource.
   */
  async findOne(id: string): Promise<JsonResponse<ReadDto>> {
    const entity = await this.repository.findOneByOrFail({ id } as any);
    return successResponse(
      this.convertToDto(entity),
      `${this.entityName} retrieved successfully`,
    );
  }

  /**
   * Updates a specific resource based on its identifier and the provided updateDto data.
   *
   * @param id The identifier of the resource to update.
   * @param updateDto The data required to update the resource.
   * @returns A promise containing the JSON response with the details of the updated resource.
   */
  async update(id: string, updateDto: UpdateDto): Promise<JsonResponse<ReadDto>> 
  {
    const entity = await this.repository.preload({
      id: id,
      ...updateDto,
    } as DeepPartial<TEntity>);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    await this.repository.save(entity);

    return successResponse(
      this.convertToDto(entity),
      `${this.entityName} updated successfully`,
    );
  }

  /**
   * Permanently deletes a specific resource from the database based on its identifier.
   *
   * @param id The identifier of the resource to hard delete.
   * @returns A promise containing the JSON response indicating the success of the operation.
   */
  async remove(id: string): Promise<JsonResponse<void>> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return successResponse(null, `${this.entityName} removed successfully`);
  }

  /**
   * Soft deletes a specific resource based on its identifier,
   * marking it as removed without permanently deleting it from the database.
   *
   * @param id The identifier of the resource to soft delete.
   * @returns A promise containing the JSON response indicating the success of the operation.
   */
  async softRemove(id: string): Promise<JsonResponse<void>> {
    const result = await this.repository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return successResponse(
      null,
      `${this.entityName} soft removed successfully`,
    );
  }

  /**
   * Restores a previously soft-deleted resource based on its identifier.
   *
   * @param id The identifier of the resource to restore.
   * @returns A promise containing the JSON response indicating the success of the operation.
   */
  async restore(id: string): Promise<JsonResponse<void>> {
    const result = await this.repository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return successResponse(null, `${this.entityName} restored successfully`);
  }
}
