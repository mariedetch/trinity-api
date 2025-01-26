import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Command } from '../commands/command.entity';
import { CommandProduct } from '../commands/command-product.entity';
import { Product } from '../products/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CommandStatus } from '../commands/enums';
import { v4 as uuidv4 } from 'uuid';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

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

  private async convertToDtoWithProducts(
    command: Command,
    commandProducts: CommandProduct[],
  ): Promise<CartResponseDto> {
    // Récupérer tous les produits associés
    const products = await this.productRepository.findBy({
      id: In(commandProducts.map((cp) => cp.product_id)),
    });

    // Créer un Map pour un accès facile aux produits
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    return {
      command_id: command.id,
      reference: command.reference,
      status: command.status,
      products: commandProducts.map((cp) => ({
        commandProduct_id: cp.id,
        id: cp.product_id,
        name: productMap.get(cp.product_id)?.name || '',
        picture: productMap.get(cp.product_id)?.picture || '',
        quantity: cp.quantity,
      })),
    };
  }

  // Récupérer le panier d'un user
  async getCart(userId: string): Promise<JsonResponse<CartResponseDto>> {
    const command = await this.commandRepository.findOne({
      where: {
        user_id: userId,
        status: CommandStatus.INITIATED,
      },
    });

    if (!command) {
      return successResponse(
        {
          command_id: null,
          reference: null,
          status: null,
          products: [],
        },
        'No active cart found',
        200,
      );
    }

    // Récupérer les produits de la commande
    const commandProducts = await this.commandProductRepository.find({
      where: { command_id: command.id },
    });

    const cartDto = await this.convertToDtoWithProducts(
      command,
      commandProducts,
    );

    return successResponse(cartDto, 'Cart retrieved successfully', 200);
  }

  // Ajouter un produit au panier d'un user
  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<JsonResponse<CartResponseDto>> {
    // Vérifier si le produit existe
    const product = await this.productRepository.findOne({
      where: { id: addToCartDto.product_id },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${addToCartDto.product_id} not found`,
      );
    }

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
        total_price_incl: 0,
        total_price_excl: 0,
        shipping_charge: 0,
        status: CommandStatus.INITIATED,
        shipping_address: null,
        meta_data: {},
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
      command_id: command.id,
      product_id: addToCartDto.product_id,
      quantity: addToCartDto.quantity,
      unit_price_incl: 0,
      unit_price_excl: 0,
      total_price_incl: 0,
      total_price_excl: 0,
    });

    // Retourner le panier mis à jour
    return this.getCart(userId);
  }

  // Update d'un produit dans un panier
  async updateCartItem(
    userId: string,
    commandProductId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<JsonResponse<CartResponseDto>> {
    // Vérifier que le produit existe dans le panier
    const commandProduct = await this.commandProductRepository.findOne({
      where: { id: commandProductId },
      relations: ['command'],
    });

    if (!commandProduct) {
      throw new NotFoundException(
        `Product with id ${commandProductId} not found in cart`,
      );
    }

    // Vérifier que le panier appartient à l'utilisateur
    if (commandProduct.command.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this cart item');
    }

    // Si la quantité est 0, supprimer le produit
    if (updateCartItemDto.quantity === 0) {
      await this.commandProductRepository.remove(commandProduct);
    } else {
      await this.commandProductRepository.update(commandProductId, {
        quantity: updateCartItemDto.quantity,
      });
    }

    // Récupérer le panier mis à jour
    return this.getCart(userId);
  }

  // Supprimer un produit du panier
  async removeCartItem(
    userId: string,
    commandProductId: string,
  ): Promise<JsonResponse<CartResponseDto>> {
    const commandProduct = await this.commandProductRepository.findOne({
      where: { id: commandProductId },
      relations: ['command'],
    });

    if (!commandProduct) {
      throw new NotFoundException(
        `Product with id ${commandProductId} not found in cart`,
      );
    }
    if (commandProduct.command.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this cart item');
    }

    // Supprimer le produit
    await this.commandProductRepository.remove(commandProduct);

    // Récupérer le panier mis à jour
    return this.getCart(userId);
  }
}
