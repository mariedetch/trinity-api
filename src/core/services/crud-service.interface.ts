import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { PaginationResource } from '../interfaces/pagination-resource.interface';

export interface CrudService<TEntity, ReadDto, CreateDto, UpdateDto> {
  /**
   * Creates a new resource based on the provided createDto data.
   *
   * @param createDto The data required to create the new resource.
   * @returns A promise containing the JSON response with the details of the newly created resource.
   */
  create(createDto: CreateDto): Promise<JsonResponse<ReadDto>>;

  /**
   * Retrieves a paginated list of all resources.
   *
   * @param page The page number to retrieve.
   * @param perPage The number of resources per page.
   * @returns A promise containing the JSON response with the paginated list of resources.
   */
  findAll(
    page: number,
    perPage: number,
  ): Promise<JsonResponse<PaginationResource<ReadDto>>>;

  /**
   * Retrieves a specific resource based on its identifier.
   *
   * @param id The identifier of the resource to retrieve.
   * @returns A promise containing the JSON response with the details of the retrieved resource.
   */
  findOne(id: string): Promise<JsonResponse<ReadDto>>;

  /**
   * Updates a specific resource based on its identifier and the provided updateDto data.
   *
   * @param id The identifier of the resource to update.
   * @param updateDto The data required to update the resource.
   * @returns A promise containing the JSON response with the details of the updated resource.
   */
  update(id: string, updateDto: UpdateDto): Promise<JsonResponse<ReadDto>>;

  /**
   * Permanently deletes a specific resource from the database based on its identifier.
   *
   * @param id The identifier of the resource to hard delete.
   * @returns A promise containing the JSON response indicating the success of the operation.
   */
  remove(id: string): Promise<JsonResponse<void>>;

  /**
   * Restores a previously soft-deleted resource based on its identifier.
   *
   * @param id The identifier of the resource to restore.
   * @returns A promise containing the JSON response indicating the success of the operation.
   */
  restore(id: string): Promise<JsonResponse<void>>;

  /**
   * Soft deletes a specific resource based on its identifier,
   * marking it as removed without permanently deleting it from the database.
   *
   * @param id The identifier of the resource to soft delete.
   * @returns A promise containing the JSON response indicating the success of the operation.
   */
  softRemove(id: string): Promise<JsonResponse<void>>;
}
