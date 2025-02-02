import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Command } from './command.entity';
import { CommandProduct } from './command-product.entity';
import { Product } from '../products/product.entity';
import { CommandStatus } from './enums';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { CommandStatsDto } from './dto/command-stats.dto';
import { CommandDetailDto } from './dto/command-detail.dto';
import { CommandProductsDto } from './dto/command-products.dto';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { UpdateCommandStatusDto } from './dto/update-command-status.dto';
import { CartItem } from '../carts/dto/cart-response.dto';
import { plainToClass } from 'class-transformer';

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
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}


  private async convertToDtoWithProducts(
    commandProducts: CommandProduct[],
  ): Promise<CartItem[]> {
    return commandProducts.map((cp) => ({
      commandProduct_id: cp.id,
      id: cp.product_id,
      name: cp.product.name,
      picture: cp.product.picture,
      quantity: cp.quantity,
      selling_price: cp.product.selling_price,
    }));
  }

  // Route pour afficher toutes les commandes de manière paginée
  async getCommandList(query: CommandListQuery): Promise<JsonResponse<PaginationResource<CommandDetailDto>>> {
    const { page = 1, perPage = 10, status, customer, startDate, endDate, user_id } = query;
    const skip = (page - 1) * perPage;

    const queryBuilder = this.commandRepository.createQueryBuilder('command')
    .leftJoinAndSelect('command.user', 'user')
    .orderBy('command.createdAt', 'DESC')
    .skip(skip)
    .take(perPage);
  
    if (status) {
      queryBuilder.andWhere('command.status = :status', { status });
    }

    if (customer) {
      queryBuilder.andWhere(
        '(LOWER(user.first_name) LIKE :customer OR LOWER(user.last_name) LIKE :customer OR user.phonenumber LIKE :customer OR LOWER(user.email) LIKE :customer)',
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

    const result: PaginationResource<CommandDetailDto> = {
      items: items.map((command) => (plainToClass(CommandDetailDto, command))),
      currentPage: page,
      perPage,
      total
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
      this.commandRepository.count({ where: { status: CommandStatus.INITIATED }, }),
      this.commandRepository.count({ where: { status: CommandStatus.SHIPPED }, }),
      this.commandRepository.count({ where: { status: CommandStatus.DELIVERED }, }),
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
  async getCommandDetails(commandId: string): Promise<JsonResponse<CommandDetailDto>> {
    const command = await this.commandRepository.findOne({
      where: { id: commandId },
      relations: ['user'],
    });

    if (!command) {
      throw new NotFoundException(`Command with ID ${commandId} not found`);
    }

    return successResponse(plainToClass(CommandDetailDto, command), 'Command details retrieved successfully');
  }


  // Route pour récupérer les produits qui sont dans une commande
  async getCommandProducts(commandId: string): Promise<JsonResponse<CartItem[]>> {
    const command_products = await this.commandProductRepository.find({
      where: { command_id: commandId },
      relations: ['product'],
    });

    /*if (!command) {
      throw new NotFoundException(`Command with ID ${commandId} not found`);
    }*/

    const dto =  await this.convertToDtoWithProducts(command_products);
    return successResponse(dto, 'Command products retrieved successfully');
  }

  // Route pour modifier le statut d'une commande

  async updateCommandStatus(updateDto: UpdateCommandStatusDto): Promise<JsonResponse<CommandDetailDto>> {
    const command = await this.commandRepository.findOne({
      where: { id: updateDto.command_id },
    });

    if (!command) {
      throw new BadRequestException('Command not found');
    }

    // Vérifier les transitions autorisées de statut
    if (
      (command.status === CommandStatus.PAID && updateDto.new_status === CommandStatus.IN_PROGRESS) ||
      (command.status === CommandStatus.IN_PROGRESS && updateDto.new_status === CommandStatus.SHIPPED) ||
      (command.status === CommandStatus.SHIPPED && updateDto.new_status === CommandStatus.DELIVERED)
    ) {
      // Mise à jour du statut et des méta-données
      command.status = updateDto.new_status;

      // Mise à jour des méta-données dans le champ JSON
      const metaData = command.meta_data ;
      if (updateDto.new_status === CommandStatus.IN_PROGRESS) {
        if (!updateDto.shipping_charge) {
          throw new BadRequestException('Shipping charge is required to update status to IN_PROGRESS');
        }
        metaData.validated_at = new Date();
        command.shipping_charge = updateDto.shipping_charge;
      } else if (updateDto.new_status === CommandStatus.SHIPPED) {
        metaData.shipped_at = new Date();
      } else if (updateDto.new_status === CommandStatus.DELIVERED) {
        metaData.delivered_at = new Date();
      }
      command.meta_data = metaData;

      await this.commandRepository.save(command);
      return this.getCommandDetails(command.id)

    } else {
      throw new BadRequestException('Invalid status transition');
    }
  }


}
