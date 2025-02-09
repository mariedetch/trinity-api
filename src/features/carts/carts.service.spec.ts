import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartsService } from './carts.service';
import { Command } from '../commands/command.entity';
import { CommandProduct } from '../commands/command-product.entity';
import { Product } from '../products/product.entity';
import { CommandStatus } from '../commands/enums';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('CartsService', () => {
  let service: CartsService;
  let commandRepository: Repository<Command>;
  let commandProductRepository: Repository<CommandProduct>;
  let productRepository: Repository<Product>;

  const mockCommandRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCommandProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: getRepositoryToken(Command),
          useValue: mockCommandRepository,
        },
        {
          provide: getRepositoryToken(CommandProduct),
          useValue: mockCommandProductRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    commandRepository = module.get<Repository<Command>>(
      getRepositoryToken(Command),
    );
    commandProductRepository = module.get<Repository<CommandProduct>>(
      getRepositoryToken(CommandProduct),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return empty cart when no active cart exists', async () => {
      mockCommandRepository.findOne.mockResolvedValue(null);

      const result = await service.getCart('user-123');

      expect(result.data).toEqual({
        command_id: null,
        reference: null,
        status: null,
        products: [],
      });
      expect(result.message).toBe('No active cart found');
    });

    it('should return cart with products when active cart exists', async () => {
      const mockCommand = {
        id: 'cmd-123',
        reference: 'CMD-123',
        status: CommandStatus.INITIATED,
      };

      const mockProducts = [
        {
          id: 'cp-1',
          command_id: 'cmd-123',
          product_id: 'prod-1',
          quantity: 2,
          product: {
            name: 'Product 1',
            picture: 'pic1.jpg',
            selling_price: 10,
          },
        },
      ];

      mockCommandRepository.findOne.mockResolvedValue(mockCommand);
      mockCommandProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getCart('user-123');

      expect(result.data.command_id).toBe('cmd-123');
      expect(result.data.products).toHaveLength(1);
      expect(result.message).toBe('Cart retrieved successfully');
    });
  });

  describe('addToCart', () => {
    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addToCart('user-123', {
          product_id: 'non-existent',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new cart if none exists', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Product 1',
        picture: 'pic1.jpg',
        selling_price: 10,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockCommandRepository.findOne.mockResolvedValue(null);
      mockCommandRepository.save.mockResolvedValue({ id: 'cmd-123' });
      mockCommandProductRepository.save.mockResolvedValue({
        id: 'cp-1',
        product_id: 'prod-1',
        quantity: 1,
      });

      const result = await service.addToCart('user-123', {
        product_id: 'prod-1',
        quantity: 1,
      });

      expect(result.data.id).toBe('prod-1');
      expect(result.message).toBe('Product added successfully');
    });
  });

  describe('updateCartItem', () => {
    it('should throw NotFoundException when cart item does not exist', async () => {
      mockCommandProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCartItem('user-123', 'non-existent', { quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when cart belongs to different user', async () => {
      mockCommandProductRepository.findOne.mockResolvedValue({
        command: { user_id: 'different-user' },
      });

      await expect(
        service.updateCartItem('user-123', 'cp-1', { quantity: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should remove item when quantity is 0', async () => {
      const mockCommandProduct = {
        id: 'cp-1',
        command: { user_id: 'user-123' },
        product: {
          name: 'Product 1',
          picture: 'pic1.jpg',
          selling_price: 10,
        },
      };

      mockCommandProductRepository.findOne.mockResolvedValue(
        mockCommandProduct,
      );

      const result = await service.updateCartItem('user-123', 'cp-1', {
        quantity: 0,
      });

      expect(mockCommandProductRepository.remove).toHaveBeenCalled();
      expect(result.message).toBe('Product updated successfully');
    });
  });

  describe('validateCart', () => {
    it('should throw NotFoundException when no active cart exists', async () => {
      mockCommandRepository.findOne.mockResolvedValue(null);

      await expect(service.validateCart('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate cart and update prices', async () => {
      const mockCommand = {
        id: 'cmd-123',
        status: CommandStatus.INITIATED,
        command_products: [
          {
            id: 'cp-1',
            product_id: 'prod-1',
            quantity: 2,
          },
        ],
        total_price_excl: 0,
        total_price_incl: 0,
      };

      const mockProduct = {
        id: 'prod-1',
        selling_price: 10,
      };

      mockCommandRepository.findOne.mockResolvedValue(mockCommand);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockCommandRepository.save.mockResolvedValue({
        ...mockCommand,
        status: CommandStatus.VALIDATED,
      });

      const result = await service.validateCart('user-123');

      expect(result.data.status).toBe(CommandStatus.VALIDATED);
      expect(result.message).toBe('Cart Validated successfully');
    });
  });
});
