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
import { plainToClass } from 'class-transformer';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { CartItem, CartResponseDto } from './dto/cart-response.dto';
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

  private TVA = 1.18

  private async convertToDtoWithProducts(
    command: Command,
    commandProducts: CommandProduct[],
  ): Promise<CartResponseDto> {
    return {
      command_id: command.id,
      reference: command.reference,
      status: command.status,
      products: commandProducts.map((cp) => ({
        commandProduct_id: cp.id,
        id: cp.product_id,
        name: cp.product.name,
        picture: cp.product.picture,
        selling_price: cp.product.selling_price,
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
      relations: ['product']
    });

    const cartDto = await this.convertToDtoWithProducts(
      command,
      commandProducts,
    );

    return successResponse(cartDto, 'Cart retrieved successfully', 200);
  }

  // Route pour ajouter un produit au panier d'un user
  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<JsonResponse<CartItem>> {
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
      command_id: command.id,
      product_id: addToCartDto.product_id,
      quantity: addToCartDto.quantity
    });

    // Retourner le panier mis à jour
    return successResponse(
      {
        commandProduct_id: newProduct.id,
        id: newProduct.product_id,
        name: product.name,
        picture: product.picture,
        selling_price: product.selling_price,
        quantity: newProduct.quantity,
      },
      "Product added successfully"
    )
  }

  // Update d'un produit dans un panier
  async updateCartItem(
    userId: string,
    commandProductId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<JsonResponse<CartItem>> {
    // Vérifier que le produit existe dans le panier
    const commandProduct = await this.commandProductRepository.findOne({
      where: { id: commandProductId },
      relations: ['command', 'product'],
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
    return successResponse(
      {
        commandProduct_id: commandProduct.id,
        id: commandProduct.product_id,
        name: commandProduct.product.name,
        picture: commandProduct.product.picture,
        selling_price: commandProduct.product.selling_price,
        quantity: updateCartItemDto.quantity,
      },
      "Product updated successfully"
    )
  }

  // Route pour valider un panier avant payement
  async validateCart(
    userId: string
  ): Promise<JsonResponse<CartResponseDto>> {

    // Recherche d'une commande existante avec le statut INITIATED
    let command = await this.commandRepository.findOne({
      where: {
        user_id: userId,
        status: CommandStatus.INITIATED,
      },
      relations: ['command_products'], // Charger les produits associés
    });

    if (!command) {
      throw new NotFoundException(`Cart Empty`);
    }

    command.command_products.forEach(async commandItem => {
      const product = await this.productRepository.findOne({
        where: { id: commandItem.product_id }
      })

      const unit_price_excl = product.selling_price,
            unit_price_incl = product.selling_price * this.TVA,
            total_price_excl = unit_price_excl * commandItem.quantity,
            total_price_incl = unit_price_incl * commandItem.quantity;

      await this.commandProductRepository.update(
        commandItem.id,
        {
          unit_price_excl,
          unit_price_incl,
          total_price_excl,
          total_price_incl
        }
      );

      command.total_price_excl += total_price_excl
      command.total_price_incl += total_price_incl
    });

    command.status = CommandStatus.VALIDATED
    const updatedCommand = await this.commandRepository.save(command);

    return successResponse(
      plainToClass(CartResponseDto, updatedCommand),
      "Cart Validated successfully"
    )
  }

  // Supprimer un produit du panier
  async removeCartItem(
    userId: string,
    commandProductId: string,
  ): Promise<JsonResponse<void>> {
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
    return successResponse(null, "Product removed successfully");
  }
}
