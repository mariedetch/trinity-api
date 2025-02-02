import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
import { SortDirection } from 'src/common/utils/constants';
import { ValidatedCommandStatus } from '../commands/enums';
import { Command } from '../commands/command.entity';
import { CustomerDto } from './dto/customer.dto';
import { CommandDto } from '../commands/dto/command-detail.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,

    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>
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
    sortDirection: SortDirection,
    keyword: string
  ): Promise<JsonResponse<PaginationResource<UserDto>>> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .where('user.role = :role', { role: Role.CUSTOMER })
      .orderBy('user.first_name', sortDirection)
      .skip(((page <= 0 ? 1 : page) - 1) * perPage)
      .take(perPage);

    if (keyword) {
      queryBuilder.andWhere(
        `(user.first_name ILIKE :keyword 
          OR user.last_name ILIKE :keyword 
          OR user.email ILIKE :keyword 
          OR user.phonenumber ILIKE :keyword)`,
        { keyword: `%${keyword}%` }
      );
    }

    const [entities, total] = await queryBuilder.getManyAndCount();

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
  async findOne(id: string): Promise<JsonResponse<CustomerDto>> {
    const entity = await this.repository.findOne({
      where: { id, role: Role.CUSTOMER },
    } as any);

    const customer = plainToClass(CustomerDto, entity)

    // Récupérer la dernière commande
    const lastOrder = await this.commandRepository.findOne({
      where: { user_id: id, status: In(Object.values(ValidatedCommandStatus)) },
      order: { createdAt: 'DESC' },
      relations: ['command_products'],
    });

    // Calcul de la valeur moyenne des commandes
    const avgOrder = await this.commandRepository
      .createQueryBuilder('command')
      .select('AVG(command.total_price_incl)')
      .where('command.user_id = :customerId', { customerId: id })
      .getRawOne();

    customer.lastOrder = plainToClass(CommandDto, lastOrder)
    customer.avgOrder = avgOrder.avg

    return successResponse(customer, `Customer retrieved successfully`);
  }
}
