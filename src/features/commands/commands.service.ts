import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from './command.entity';
import { CommandProduct } from './command-product.entity';
import { Product } from '../products/product.entity';
import { CreateCommandDto } from './dto/create-command.dto';
import { CommandDto } from './dto/command.dto';
import { CommandStatus } from './enums';
import { JsonResponse, successResponse } from 'src/common/helpers/json-response.helper';
import { plainToInstance } from 'class-transformer';

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

  private generateReference(): string {
    return `CMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async create(createCommandDto: CreateCommandDto): Promise<JsonResponse<CommandDto>> {
    // 1. Récupérer les produits demandés
    const productsIds = createCommandDto.products.map(p => p.product_id);
    const products = await this.productRepository.findByIds(productsIds);

    // Vérifier que tous les produits existent
    if (products.length !== productsIds.length) {
      throw new NotFoundException('Some products were not found');
    }

    // 2. Calculer d'abord les totaux
    let total_price_excl = 0;
    let total_price_incl = 0;

    const commandProductsData = createCommandDto.products.map(productDto => {
      const product = products.find(p => p.id === productDto.product_id);
      
      const unit_price_excl = product.selling_price;
      const unit_price_incl = unit_price_excl * 1.2; // TVA 20%
      const total_product_price_excl = unit_price_excl * productDto.quantity;
      const total_product_price_incl = unit_price_incl * productDto.quantity;

      total_price_excl += total_product_price_excl;
      total_price_incl += total_product_price_incl;

      return {
        product,
        unit_price_excl,
        unit_price_incl,
        total_price_excl: total_product_price_excl,
        total_price_incl: total_product_price_incl,
        quantity: productDto.quantity
      };
    });

    // 3. Créer la commande avec les totaux
    const command = this.commandRepository.create({
      user_id: createCommandDto.user_id,
      reference: this.generateReference(),
      shipping_address: createCommandDto.shipping_address,
      shipping_charge: createCommandDto.shipping_charge,
      status: CommandStatus.CREATED,
      meta_data: {
        created_at: new Date()
      },
      total_price_excl: total_price_excl,
      total_price_incl: total_price_incl
    });

    // 4. Sauvegarder la commande
    const savedCommand = await this.commandRepository.save(command);

    // 5. Créer et sauvegarder les command_products
    const commandProducts = commandProductsData.map(data => 
      this.commandProductRepository.create({
        command_id: savedCommand.id,
        product_id: data.product.id,
        quantity: data.quantity,
        unit_price_excl: data.unit_price_excl,
        unit_price_incl: data.unit_price_incl,
        total_price_excl: data.total_price_excl,
        total_price_incl: data.total_price_incl
      })
    );

    await this.commandProductRepository.save(commandProducts);

    return successResponse(
      this.convertToDto(savedCommand),
      'Command created successfully'
    );
  }

  private convertToDto(command: Command): CommandDto {
    return plainToInstance(CommandDto, command, {
      excludeExtraneousValues: true
    });
  }
}