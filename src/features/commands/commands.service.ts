import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Command } from './command.entity';
import { CommandProduct } from './command-product.entity';
import { CommandStatus, ValidatedCommandStatus } from './enums';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { CommandStatsDto } from './dto/command-stats.dto';
import { CommandDto } from './dto/command-detail.dto';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { UpdateCommandStatusDto } from './dto/update-command-status.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CommandProductDto } from './dto/command-products.dto';
import { SortDirection } from 'src/common/utils/constants';
import { v4 as uuidv4 } from 'uuid';

interface CommandListQuery {
  page?: number;
  perPage?: number;
  status?: CommandStatus;
  customer?: string;
  startDate?: Date;
  endDate?: Date;
  user_id?: string;
  sortDir?: SortDirection;
}

@Injectable()
/**
 * Service responsible for managing commands and their related operations.
 */
export class CommandsService {
  /**
   * Constructor for CommandsService.
   * @param commandRepository - Repository for managing `Command` entities.
   * @param commandProductRepository - Repository for managing `CommandProduct` entities.
   */
  constructor(
    @InjectRepository(Command)
    private commandRepository: Repository<Command>,
    @InjectRepository(CommandProduct)
    private commandProductRepository: Repository<CommandProduct>,
  ) {}

  /**
   * Retrieves a paginated list of commands based on the provided query parameters.
   * @param query - Query parameters for filtering and paginating commands.
   * @returns A JSON response containing the paginated list of commands.
   */
  async getCommandList(
    query: CommandListQuery,
  ): Promise<JsonResponse<PaginationResource<CommandDto>>> {
    const { page = 1, perPage = 10 } = query;
    const filters: Record<string, any> = {};

    if (query.status) filters['status'] = query.status;
    if (query.user_id) filters['user_id'] = query.user_id;
    if (query.startDate || query.endDate) {
      filters['createdAt'] = {};
      if (query.startDate) filters['createdAt']['$gte'] = query.startDate;
      if (query.endDate) filters['createdAt']['$lte'] = query.endDate;
    }

    const queryBuilder = this.commandRepository
      .createQueryBuilder('command')
      .leftJoinAndSelect('command.user', 'user')
      .where(filters);

    if (query.customer) {
      queryBuilder.andWhere(
        `(LOWER(user.first_name) LIKE :customer
          OR LOWER(user.last_name) LIKE :customer
          OR user.phonenumber LIKE :customer
          OR LOWER(user.email) LIKE :customer)`,
        { customer: `%${query.customer.toLowerCase()}%` },
      );
    }

    const [items, total] = await queryBuilder
      .orderBy('command.createdAt', query.sortDir)
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    const result: PaginationResource<CommandDto> = {
      items: plainToInstance(CommandDto, items),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(result, 'Commands list retrieved successfully');
  }

  /**
   * Retrieves statistics about commands, including total, waiting, shipped, and delivered counts.
   * @returns A JSON response containing command statistics.
   */
  async getCommandStats(): Promise<JsonResponse<CommandStatsDto>> {
    const result = await this.commandRepository
      .createQueryBuilder('command')
      .select([
        `SUM(CASE WHEN command.status NOT IN ('INITIATED', 'VALIDATED') THEN 1 ELSE 0 END) AS total_commands`,
        'SUM(CASE WHEN command.status = :paid THEN 1 ELSE 0 END) AS waiting_commands',
        'SUM(CASE WHEN command.status = :shipped THEN 1 ELSE 0 END) AS shipped_commands',
        'SUM(CASE WHEN command.status = :delivered THEN 1 ELSE 0 END) AS delivered_commands',
      ])
      .setParameters({
        paid: CommandStatus.PAID,
        shipped: CommandStatus.SHIPPED,
        delivered: CommandStatus.DELIVERED,
      })
      .getRawOne();

    const stats: CommandStatsDto = {
      total_commands: parseInt(result.total_commands, 10),
      waiting_commands: parseInt(result.waiting_commands, 10),
      shipped_commands: parseInt(result.shipped_commands, 10),
      delivered_commands: parseInt(result.delivered_commands, 10),
    };

    return successResponse(stats, 'Command statistics retrieved successfully');
  }

  /**
   * Retrieves the details of a specific command by its ID.
   * @param commandId - The ID of the command to retrieve.
   * @returns A JSON response containing the command details.
   */
  async getCommandById(commandId: string): Promise<JsonResponse<CommandDto>> {
    const command = await this.commandRepository.findOneOrFail({
      where: { id: commandId },
      relations: ['user'],
    });

    return successResponse(
      plainToClass(CommandDto, command),
      'Command details retrieved successfully',
    );
  }

  /**
   * Retrieves the products associated with a specific command.
   * @param commandId - The ID of the command whose products are to be retrieved.
   * @returns A JSON response containing the list of command products.
   */
  async getCommandItems(
    commandId: string,
  ): Promise<JsonResponse<CommandProductDto[]>> {
    const command_products = await this.commandProductRepository.find({
      where: { command_id: commandId },
      relations: ['product'],
    });
    const result = plainToInstance(CommandProductDto, command_products);

    return successResponse(result, 'Command products retrieved successfully');
  }

  /**
   * Updates the status of a specific command.
   * @param commandId - The ID of the command to update.
   * @param updateDto - Data transfer object containing the new status and optional metadata.
   * @returns A JSON response containing the updated command details.
   * @throws BadRequestException - If the status transition is invalid or required fields are missing.
   */
  async updateCommandStatus(
    commandId: string,
    updateDto: UpdateCommandStatusDto,
  ): Promise<JsonResponse<CommandDto>> {
    const command = await this.commandRepository.findOneOrFail({
      where: { id: commandId },
    });

    // Vérifier les transitions autorisées de statut
    if (!command.canTransitTo(updateDto.new_status)) {
      throw new BadRequestException('Invalid status transition');
    }

    // Mise à jour du statut et des méta-données
    // Mise à jour des méta-données dans le champ JSON
    command.status = updateDto.new_status;
    command.setMetaData(updateDto.new_status);

    await this.commandRepository.save(command);

    return successResponse(
      plainToClass(CommandDto, command),
      'Command updated successfully',
    );
  }

  /**
   * Retrieves the list of commands associated with a specific customer.
   * @param customerId - The ID of the customer whose commands are to be retrieved.
   * @returns A JSON response containing the list of commands.
   */
  async getCommandsByCustomerId(
    customerId: string,
  ): Promise<JsonResponse<CommandDto[]>> {
    const commands = await this.commandRepository.find({
      where: {
        user_id: customerId,
        status: In(Object.values(ValidatedCommandStatus)),
      },
      order: { id: 'DESC' },
      take: 10,
    });

    return successResponse(
      plainToInstance(CommandDto, commands),
      'Commands retrieved successfully',
    );
  }

  /**
   * Creates a new command for a specific user.
   * @param userId - The ID of the user for whom the command is to be created.
   * @returns The newly created command entity.
   */
  async initiateCommand(userId: string): Promise<Command> {
    const command = await this.commandRepository.save({
      user_id: userId,
      reference: `CMD-${uuidv4()}`,
      status: CommandStatus.INITIATED,
      shipping_address: {},
      meta_data: {
        paid_at: null,
        validated_at: null,
        shipped_at: null,
        delivered_at: null,
      },
    });

    return command;
  }

  /**
   * Retrieves a cartable command for a specific user.
   * @param userId - The ID of the user whose cartable command is to be retrieved.
   * @param relations - Optional array of related entities to include in the result.
   * @returns The cartable command entity.
   */
  async getUserCartable(
    userId: string,
    relations: string[] = [],
  ): Promise<Command> {
    return this.commandRepository.findOne({
      where: {
        user_id: userId,
        status: In([CommandStatus.INITIATED, CommandStatus.VALIDATED]),
      },
      relations: relations,
    });
  }

  /**
   * Finds a specific command by its ID.
   * @param id - The ID of the command to find.
   * @param relations - Optional array of related entities to include in the result.
   * @returns The command entity.
   */
  async findCommandById(
    id: string,
    relations: string[] = [],
  ): Promise<Command> {
    return this.commandRepository.findOneOrFail({
      where: { id },
      relations: relations,
    });
  }
}
