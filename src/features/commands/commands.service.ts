import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

interface CommandListQuery {
  page?: number;
  perPage?: number;
  status?: CommandStatus;
  customer?: string;
  startDate?: Date;
  endDate?: Date;
  user_id?: string;
}

@Injectable()
export class CommandsService {
  constructor(
    @InjectRepository(Command)
    private commandRepository: Repository<Command>,
    @InjectRepository(CommandProduct)
    private commandProductRepository: Repository<CommandProduct>,
  ) {}

  // Route pour afficher toutes les commandes de manière paginée
  async getCommandList(
    query: CommandListQuery,
  ): Promise<JsonResponse<PaginationResource<CommandDto>>> {
    const {
      page = 1,
      perPage = 10,
      status,
      customer,
      startDate,
      endDate,
      user_id,
    } = query;
    const skip = (page - 1) * perPage;

    const queryBuilder = this.commandRepository
      .createQueryBuilder('command')
      .leftJoinAndSelect('command.user', 'user')
      .orderBy('command.createdAt', 'DESC')
      .skip(skip)
      .take(perPage);

    if (status) {
      queryBuilder.andWhere('command.status = :status', { status });
    }

    if (customer) {
      queryBuilder.andWhere(
        `(LOWER(user.first_name) LIKE :customer
          OR LOWER(user.last_name) LIKE :customer
          OR user.phonenumber LIKE :customer
          OR LOWER(user.email) LIKE :customer)`,
        { customer: `%${customer.toLowerCase()}%` },
      );
    }

    if (startDate) {
      queryBuilder.andWhere('command.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('command.createdAt <= :endDate', { endDate });
    }

    if (user_id) {
      queryBuilder.andWhere('command.user_id = :user_id', { user_id });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    const result: PaginationResource<CommandDto> = {
      items: items.map((command) => plainToClass(CommandDto, command)),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(result, 'Commands list retrieved successfully');
  }

  // Route pour récuperer les stats des commandes
  async getCommandStats(): Promise<JsonResponse<CommandStatsDto>> {
    const [
      total_commands,
      waiting_commands,
      shipped_commands,
      delivered_commands,
    ] = await Promise.all([
      this.commandRepository.count(),
      this.commandRepository.count({ where: { status: CommandStatus.PAID } }),
      this.commandRepository.count({
        where: { status: CommandStatus.SHIPPED },
      }),
      this.commandRepository.count({
        where: { status: CommandStatus.DELIVERED },
      }),
    ]);

    const stats: CommandStatsDto = {
      total_commands,
      waiting_commands,
      shipped_commands,
      delivered_commands,
    };

    return successResponse(stats, 'Command statistics retrieved successfully');
  }

  // Route pour avoir les détails d'une commande
  async getCommandById(commandId: string): Promise<JsonResponse<CommandDto>> {
    const command = await this.commandRepository.findOne({
      where: { id: commandId },
      relations: ['user'],
    });

    if (!command) {
      throw new NotFoundException(`Command with ID ${commandId} not found`);
    }

    return successResponse(
      plainToClass(CommandDto, command),
      'Command details retrieved successfully',
    );
  }

  // Route pour récupérer les produits qui sont dans une commande
  async getCommandProducts(
    commandId: string,
  ): Promise<JsonResponse<CommandProductDto[]>> {
    const command_products = await this.commandProductRepository.find({
      where: { command_id: commandId },
      relations: ['product'],
    });

    const result = plainToInstance(CommandProductDto, command_products);
    return successResponse(result, 'Command products retrieved successfully');
  }

  // Route pour modifier le statut d'une commande
  async updateCommandStatus(
    commandId: string,
    updateDto: UpdateCommandStatusDto,
  ): Promise<JsonResponse<CommandDto>> {
    const command = await this.commandRepository.findOneOrFail({
      where: { id: commandId },
    });

    // Vérifier les transitions autorisées de statut
    if (
      (command.status === CommandStatus.PAID &&
        updateDto.new_status === CommandStatus.IN_PROGRESS) ||
      (command.status === CommandStatus.IN_PROGRESS &&
        updateDto.new_status === CommandStatus.SHIPPED) ||
      (command.status === CommandStatus.SHIPPED &&
        updateDto.new_status === CommandStatus.DELIVERED)
    ) {
      // Mise à jour du statut et des méta-données
      command.status = updateDto.new_status;

      // Mise à jour des méta-données dans le champ JSON
      if (updateDto.new_status === CommandStatus.IN_PROGRESS) {
        if (!updateDto.shipping_charge) {
          throw new BadRequestException(
            'Shipping charge is required to update status to IN_PROGRESS',
          );
        }
        command.meta_data.validated_at = new Date();
        command.shipping_charge = updateDto.shipping_charge;
      } else if (updateDto.new_status === CommandStatus.SHIPPED) {
        command.meta_data.shipped_at = new Date();
      } else if (updateDto.new_status === CommandStatus.DELIVERED) {
        command.meta_data.delivered_at = new Date();
      }

      await this.commandRepository.save(command);

      return successResponse(
        plainToClass(CommandDto, command),
        'Command updated successfully',
      );
    } else {
      throw new BadRequestException('Invalid status transition');
    }
  }

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
}
