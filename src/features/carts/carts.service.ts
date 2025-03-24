import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Command } from '../commands/command.entity';
import { CommandProduct } from '../commands/command-product.entity';
import { Product } from '../products/product.entity';
import {
  CreateCartItemDto,
  UpdateCartItemDto,
} from './dto/create-cart-item.dto';
import { CommandStatus } from '../commands/enums';
import { plainToClass, plainToInstance } from 'class-transformer';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { CartItemDto } from './dto/cart-item.dto';
import { CommandDto } from '../commands/dto/command-detail.dto';
import { CommandsService } from '../commands/commands.service';
import { InsuffisantStockException } from 'src/common/exceptions/insuffisant-stock.exception';

@Injectable()
/**
 * Service responsible for managing user carts, including adding, removing,
 * validating, and synchronizing cart items. It interacts with repositories
 * and other services to handle cart-related operations.
 */
export class CartsService {
  /**
   * Constructor for the CartsService.
   *
   * @param commandProductRepository - Repository for managing `CommandProduct` entities.
   * @param productRepository - Repository for managing `Product` entities.
   * @param commandsService - Service for handling commands and their operations.
   */
  constructor(
    @InjectRepository(CommandProduct)
    private commandProductRepository: Repository<CommandProduct>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private commandsService: CommandsService,
    private datasource: DataSource
  ) {}

  // convertToDto()

  /**
   * Retrieves the cart for a specific user.
   *
   * @param userId - The ID of the user whose cart is being retrieved.
   * @returns A promise resolving to a JSON response containing the cart items.
   */
  async getCart(userId: string): Promise<JsonResponse<CartItemDto[]>> {
    const command = await this.commandsService.getUserCartable(userId, [
      'command_products',
      'command_products.product',
    ]);
    if (!command) throw new NotFoundException('Cart is empty');
    const cartDto = plainToInstance(CartItemDto, command.command_products);

    return successResponse(cartDto, 'Cart retrieved successfully', 200);
  }

  /**
   * Creates a new cart for the user.
   *
   * @param userId - The ID of the user for whom the cart is being created.
   * @returns A promise resolving to a JSON response containing the created cart.
   */
  async createCart(
    userId: string,
    items: CreateCartItemDto[],
  ): Promise<JsonResponse<CommandDto>> {
    const existingCart = await this.commandsService.getUserCartable(userId);
    if (existingCart) {
      throw new ForbiddenException('A cart already exists for this user');
    }

    const queryRunner = this.commandProductRepository.manager.queryRunner;
    queryRunner.startTransaction();

    try {
      const newCart = await this.commandsService.initiateCommand(userId);
      const cartItems = items.map((item) => {
        return this.commandProductRepository.create({
          command_id: newCart.id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      });

      await queryRunner.manager.save(cartItems);
      queryRunner.commitTransaction();

      return successResponse(
        plainToClass(CommandDto, newCart),
        'Cart created successfully',
        201,
      );
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Adds a product to the user's cart.
   *
   * @param userId - The ID of the user adding the product to their cart.
   * @param addToCartDto - Data transfer object containing product ID and quantity.
   * @returns A promise resolving to a JSON response containing the added cart item.
   */
  async addToCart(
    userId: string,
    addToCartDto: CreateCartItemDto,
  ): Promise<JsonResponse<CartItemDto>> {
    const product = await this.productRepository.findOneOrFail({
      where: { id: addToCartDto.product_id },
    });
    const command = (await this.commandsService.getUserCartable(
      userId, ['command_products' ]
    )) || (await this.commandsService.initiateCommand(userId));

    addToCartDto.quantity += command.command_products.find(
      (item) => item.product_id == product.id
    )?.quantity || 0;

    if (product.quantity_in_stock < addToCartDto.quantity)
      throw new InsuffisantStockException();

    const result = await this.commandProductRepository.upsert([
      {
        product: product,
        command_id: command.id,
        quantity: addToCartDto.quantity,
      }],
      ['product_id', 'command_id'],
    );

    const newProduct = {
      id: result.identifiers.at(0)?.id,
      quantity: addToCartDto.quantity,
      product: {
        id: product.id,
        name: product.name,
        picture: product.picture,
        selling_price: product.selling_price,
        quantity_in_stock: product.quantity_in_stock
      }
    }

    return successResponse(newProduct, 'Product added successfully');
  }

  /**
   * Validates the user's cart before payment.
   *
   * @param userId - The ID of the user whose cart is being validated.
   * @returns A promise resolving to a JSON response containing the validated command.
   * @throws InternalServerErrorException - If an error occurs during the transaction.
   */
  async validateCart(userId: string): Promise<JsonResponse<CommandDto>> {
    // Recherche d'une commande existante avec le statut INITIATED
    const command = await this.commandsService.getUserCartable(userId, [
      'command_products',
      'command_products.product',
    ]);
    if (!command) throw new NotFoundException('Cart is empty');

    command.status = CommandStatus.VALIDATED;
    command.command_products.map(async (commandItem) => {
      if (commandItem.quantity > commandItem.product.quantity_in_stock)
        throw new InsuffisantStockException();

      commandItem.validate();
      command.total_price_excl += commandItem.total_price_excl;
      command.total_price_incl += commandItem.total_price_incl;
    });

    const queryRunner = this.datasource.createQueryRunner();
    queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(CommandProduct, command.command_products);
      await queryRunner.manager.save(Command, command);

      queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    }

    return successResponse(
      plainToClass(CommandDto, command),
      'Cart Validated successfully',
    );
  }

  /**
   * Updates a specific item in the user's cart.
   *
   * @param userId - The ID of the user whose cart is being updated.
   * @param commandProductId - The ID of the cart item to update.
   * @param updateCartItemDto - The data transfer object containing the updated cart item details.
   * @returns A promise resolving to a JSON response containing the updated cart item details.
   * @throws NotFoundException - If the specified cart item does not exist.
   */
  async updateCartItem(
    userId: string,
    commandProductId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<JsonResponse<CartItemDto>> {
    // Vérifier que le produit existe dans le panier
    const commandProduct = await this.commandProductRepository.findOneOrFail({
      where: { id: commandProductId },
      relations: ['command', 'product'],
    });
    if (commandProduct.product.quantity_in_stock < updateCartItemDto.quantity)
      throw new InsuffisantStockException();

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
    commandProduct.quantity = updateCartItemDto.quantity

    return successResponse(
      plainToClass(CartItemDto, commandProduct),
      'Product updated successfully',
    );
  }

  /**
   * Removes a product from the user's cart.
   *
   * @param userId - The ID of the user removing the product.
   * @param commandProductId - The ID of the cart item to remove.
   * @returns A promise resolving to a JSON response indicating success.
   * @throws ForbiddenException - If the user does not have access to the cart item.
   */
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
    await this.commandProductRepository.remove(commandProduct);

    return successResponse(null, 'Product removed successfully');
  }
}
