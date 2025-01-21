import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { plainToClass } from 'class-transformer';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { UserDto } from '../users/dto/user.dto';
import { Role } from '../users/enum';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  convertToDto(user: User | User[]): any {
    return plainToClass(UserDto, user);
  }

  /**
   * Retrieves a paginated list of all resources.
   *
   * @param page The page number to retrieve.
   * @param perPage The number of resources per page.
   * @returns A promise containing the JSON response with the paginated list of resources.
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<JsonResponse<PaginationResource<UserDto>>> {
    const [entities, total] = await this.repository.findAndCount({
      where: { role: Role.CUSTOMER },
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
    });
    const result: PaginationResource<UserDto> = {
      items: this.convertToDto(entities),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(result, `Customers retrieved successfully`);
  }

  /**
   * Retrieves a specific resource based on its identifier.
   *
   * @param id The identifier of the resource to retrieve.
   * @returns A promise containing the JSON response with the details of the retrieved resource.
   */
  async findOne(id: string): Promise<JsonResponse<UserDto>> {
    const entity = await this.repository.findOne({
      where: { id, role: Role.CUSTOMER },
    } as any);
    return successResponse(
      this.convertToDto(entity),
      `Customer retrieved successfully`,
    );
  }
}
