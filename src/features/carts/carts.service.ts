import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from '../commands/command.entity';
import { CommandProduct } from '../commands/command-product.entity';
import { Product } from '../products/product.entity';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/create-cart-item.dto';
import { CommandStatus } from '../commands/enums';
import { v4 as uuidv4 } from 'uuid';
import { plainToClass, plainToInstance } from 'class-transformer';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { CartItemDto } from './dto/cart-item.dto';
import { CommandDto } from '../commands/dto/command-detail.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Command)
    private commandRepository: Repository<Command>,
    @InjectRepository(CommandProduct)
    private commandProductRepository: Repository<CommandProduct>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  private TVA = 1.18;

  // Récupérer le panier d'un user
  async getCart(userId: string): Promise<JsonResponse<CartItemDto[]>> {
    const command = await this.commandRepository.findOneOrFail({
      where: {
        user_id: userId,
        status: CommandStatus.INITIATED,
      },
      relations: ['command_products', 'command_products.product'],
    });
    const cartDto = plainToInstance(CartItemDto, command.command_products);

    return successResponse(cartDto, 'Cart retrieved successfully', 200);
  }

  // Route pour ajouter un produit au panier d'un user
  async addToCart(
    userId: string, addToCartDto: CreateCartItemDto
  ): Promise<JsonResponse<CartItemDto>> {
    // Vérifier si le produit existe
    const product = await this.productRepository.findOneOrFail({
      where: { id: addToCartDto.product_id },
    });

    // Recherche d'une commande existante avec le statut INITIATED
    let command = await this.commandRepository.findOne({
      where: {
        user_id: userId,
        status: CommandStatus.INITIATED,
      },
      relations: ['command_products'], // Charger les produits associés
    });

    // Si aucune commande n'existe, on en crée une nouvelle
    if (!command) {
      command = await this.commandRepository.save({
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
    } else {
      // Vérifier si le produit existe déjà dans le panier
      const existingProduct = command.command_products.find(
        (cp) => cp.product_id === addToCartDto.product_id,
      );

      if (existingProduct) {
        throw new ConflictException(
          `Product ${addToCartDto.product_id} is already in your cart. Use update cart endpoint to modify quantity.`,
        );
      }
    }

    // Ajout du produit dans la commande (insertion dans la table command_products)
    const newProduct = await this.commandProductRepository.save({
      product: product,
      command_id: command.id,
      quantity: addToCartDto.quantity,
    });

    // Retourner le panier mis à jour
    return successResponse(plainToClass(CartItemDto, newProduct), 'Product added successfully');
  }

  // Route pour valider un panier avant payement
  async validateCart(userId: string): Promise<JsonResponse<CommandDto>> {
    // Recherche d'une commande existante avec le statut INITIATED
    const command = await this.commandRepository.findOneOrFail({
      where: {
        user_id: userId,
        status: CommandStatus.INITIATED,
      },
      relations: ['command_products'], // Charger les produits associés
    });

    command.command_products.forEach(async (commandItem) => {
      const product = await this.productRepository.findOne({
        where: { id: commandItem.product_id },
      });

      const unit_price_excl = product.selling_price,
        unit_price_incl = product.selling_price * this.TVA,
        total_price_excl = unit_price_excl * commandItem.quantity,
        total_price_incl = unit_price_incl * commandItem.quantity;

      await this.commandProductRepository.update(commandItem.id, {
        unit_price_excl,
        unit_price_incl,
        total_price_excl,
        total_price_incl,
      });

      command.total_price_excl += total_price_excl;
      command.total_price_incl += total_price_incl;
    });

    command.status = CommandStatus.VALIDATED;
    const updatedCommand = await this.commandRepository.save(command);

    return successResponse(
      plainToClass(CommandDto, updatedCommand),
      'Cart Validated successfully',
    );
  }

  async syncCart(
    userId: string, cartItems: UpdateCartItemDto[]
  ): Promise<JsonResponse<void>> {
    const command = await this.commandRepository.findOne({
      where: {
        user_id: userId,
        status: CommandStatus.INITIATED,
      },
      relations: ['command_products', 'command_products.product'],
    });

    if (!command) {
      const command = await this.commandRepository.save({
        user_id: userId,
        reference: `CMD-${uuidv4()}`,
        status: CommandStatus.INITIATED,
      })

      const items = cartItems.map(item => {
        return {
          command_id: command.id,
          ...item
        }
      })

      await this.commandProductRepository.save(items)
    }

    else {
      const existingItemsMap = new Map(
        command.command_products.map((item) => [item.product.id, item])
      );

      const updatedItems: CommandProduct[] = [];

      for (const item of cartItems) {
        const commandProduct = command.command_products.find(
          cmdProduct => cmdProduct.product_id === item.product_id
        )

        if (existingItemsMap.has(item.product_id)) {
          commandProduct.quantity = item.quantity;
          updatedItems.push(commandProduct);
        } else {
          const newItem = this.commandProductRepository.create({
            command,
            product_id: item.product_id,
            quantity: item.quantity
          });
          updatedItems.push(newItem);
        }
      }

      // Suppression des éléments non présents dans la nouvelle liste
      const itemsToRemove = Array.from(existingItemsMap.values());
      if (itemsToRemove.length > 0) {
        await this.commandProductRepository.remove(itemsToRemove);
      }

      // Sauvegarde des nouvelles données
      await this.commandProductRepository.save(updatedItems);
    }

    return successResponse(null, 'Cart synchronize successfully')
  }

  // Supprimer un produit du panier
  async removeCartItem(
    userId: string,
    commandProductId: string,
  ): Promise<JsonResponse<void>> {
    const commandProduct = await this.commandProductRepository.findOneOrFail({
      where: { id: commandProductId },
      relations: ['command'],
    });

    if (commandProduct.command.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this cart item');
    }

    // Supprimer le produit
    await this.commandProductRepository.remove(commandProduct);

    // Récupérer le panier mis à jour
    return successResponse(null, 'Product removed successfully');
  }
}
