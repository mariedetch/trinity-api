import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from 'src/core/guards/auth.guard';

describe('CartsController', () => {
  let controller: CartsController;
  let cartsService: CartsService;

  // Simuler un utilisateur dans la requête
  const mockUser = { sub: 'user-123' };
  const mockRequest = { user: mockUser } as unknown as Request;

  // Valeurs de retour fictives pour le service
  const cartResponse = { data: { cart: [] } };
  const cartItemResponse = {
    data: { id: uuidv4(), product: 'Produit Test', quantity: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        {
          provide: CartsService,
          useValue: {
            getCart: jest.fn().mockResolvedValue(cartResponse),
            addToCart: jest.fn().mockResolvedValue(cartItemResponse),
            validateCart: jest.fn().mockResolvedValue(cartResponse),
            updateCartItem: jest.fn().mockResolvedValue(cartItemResponse),
            removeCartItem: jest.fn().mockResolvedValue({ data: null }),
          },
        },
      ],
    })
      // Override du AuthGuard pour ne pas avoir à résoudre ses dépendances
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartsController>(CartsController);
    cartsService = module.get<CartsService>(CartsService);
  });

  describe('getCart', () => {
    it("doit retourner le panier de l'utilisateur", async () => {
      const result = await controller.getCart(mockRequest);
      expect(result).toEqual(cartResponse);
      expect(cartsService.getCart).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('addToCart', () => {
    it('doit ajouter un produit au panier', async () => {
      // Assure-toi d'utiliser le nom de propriété correct (ex: product_id si tel est le DTO)
      const addToCartDto: AddToCartDto = {
        product_id: uuidv4(),
        quantity: 2,
      };

      const result = await controller.addToCart(mockRequest, addToCartDto);
      expect(result).toEqual(cartItemResponse);
      expect(cartsService.addToCart).toHaveBeenCalledWith(
        mockUser.sub,
        addToCartDto,
      );
    });
  });

  describe('validateCart', () => {
    it("doit valider le panier de l'utilisateur", async () => {
      const result = await controller.validateCart(mockRequest);
      expect(result).toEqual(cartResponse);
      expect(cartsService.validateCart).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('updateCartItem', () => {
    it('doit mettre à jour un item du panier', async () => {
      const commandProductId = uuidv4();
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 3,
      };

      const result = await controller.updateCartItem(
        mockRequest,
        commandProductId,
        updateCartItemDto,
      );
      expect(result).toEqual(cartItemResponse);
      expect(cartsService.updateCartItem).toHaveBeenCalledWith(
        mockUser.sub,
        commandProductId,
        updateCartItemDto,
      );
    });
  });

  describe('removeCartItem', () => {
    it('doit supprimer un item du panier', async () => {
      const commandProductId = uuidv4();

      const result = await controller.removeCartItem(
        mockRequest,
        commandProductId,
      );
      expect(result).toEqual({ data: null });
      expect(cartsService.removeCartItem).toHaveBeenCalledWith(
        mockUser.sub,
        commandProductId,
      );
    });
  });
});
