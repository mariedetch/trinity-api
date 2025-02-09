import { Test, TestingModule } from '@nestjs/testing';
import { CommandsService } from './commands.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Command } from './command.entity';
import { CommandProduct } from './command-product.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandStatus } from './enums';

// Création d'un mock de QueryBuilder pour tester la méthode getCommandList
const mockQueryBuilder: any = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

describe('CommandsService', () => {
  let service: CommandsService;
  let commandRepository: any;
  let commandProductRepository: any;

  beforeEach(async () => {
    // Création des mocks pour les repositories
    const mockCommandRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      count: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockCommandProductRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandsService,
        {
          provide: getRepositoryToken(Command),
          useValue: mockCommandRepository,
        },
        {
          provide: getRepositoryToken(CommandProduct),
          useValue: mockCommandProductRepository,
        },
      ],
    }).compile();

    service = module.get<CommandsService>(CommandsService);
    commandRepository = module.get(getRepositoryToken(Command));
    commandProductRepository = module.get(getRepositoryToken(CommandProduct));

    // Réinitialiser le mockQueryBuilder pour chaque test
    mockQueryBuilder.leftJoinAndSelect.mockClear();
    mockQueryBuilder.orderBy.mockClear();
    mockQueryBuilder.skip.mockClear();
    mockQueryBuilder.take.mockClear();
    mockQueryBuilder.andWhere.mockClear();
    mockQueryBuilder.getManyAndCount.mockClear();
  });

  describe('getCommandList', () => {
    it('should return a paginated list of commands', async () => {
      // On simule que le query builder retourne deux commandes et un total de 2
      const sampleCommands = [
        {
          id: '1',
          createdAt: new Date(),
          status: CommandStatus.PAID,
          user: {},
        },
        {
          id: '2',
          createdAt: new Date(),
          status: CommandStatus.SHIPPED,
          user: {},
        },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([sampleCommands, 2]);

      const query = { page: 1, perPage: 10 };
      const response = await service.getCommandList(query);

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'command.user',
        'user',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'command.createdAt',
        'DESC',
      );
      expect(response.data.items).toHaveLength(2);
      expect(response.message).toEqual('Commands list retrieved successfully');
    });
  });

  describe('getCommandStats', () => {
    it('should return command statistics', async () => {
      // On simule les compteurs pour chaque statut
      commandRepository.count.mockImplementation((options?: any) => {
        if (!options) return Promise.resolve(100);
        if (options.where && options.where.status === CommandStatus.PAID)
          return Promise.resolve(10);
        if (options.where && options.where.status === CommandStatus.SHIPPED)
          return Promise.resolve(20);
        if (options.where && options.where.status === CommandStatus.DELIVERED)
          return Promise.resolve(30);
      });

      const response = await service.getCommandStats();

      expect(response.data.total_commands).toEqual(100);
      expect(response.data.waiting_commands).toEqual(10);
      expect(response.data.shipped_commands).toEqual(20);
      expect(response.data.delivered_commands).toEqual(30);
      expect(response.message).toEqual(
        'Command statistics retrieved successfully',
      );
    });
  });

  describe('getCommandById', () => {
    it('should return command details when found', async () => {
      const sampleCommand = { id: '1', status: CommandStatus.PAID, user: {} };
      commandRepository.findOne.mockResolvedValue(sampleCommand);

      const response = await service.getCommandById('1');

      expect(commandRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
      expect(response.data).toMatchObject({
        id: '1',
        status: CommandStatus.PAID,
      });
      expect(response.message).toEqual(
        'Command details retrieved successfully',
      );
    });

    it('should throw NotFoundException when command is not found', async () => {
      commandRepository.findOne.mockResolvedValue(undefined);

      await expect(service.getCommandById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCommandProducts', () => {
    it('should return products of a command', async () => {
      const sampleProducts = [
        {
          id: 'prod1',
          quantity: 2,
          unit_price_incl: 10,
          unit_price_excl: 8,
          total_price_incl: 20,
          total_price_excl: 16,
          product: {},
        },
      ];
      commandProductRepository.find.mockResolvedValue(sampleProducts);

      const response = await service.getCommandProducts('1');

      expect(commandProductRepository.find).toHaveBeenCalledWith({
        where: { command_id: '1' },
        relations: ['product'],
      });
      expect(response.data).toHaveLength(1);
      expect(response.message).toEqual(
        'Command products retrieved successfully',
      );
    });
  });

  describe('updateCommandStatus', () => {
    it('should update the command status with valid transition PAID -> IN_PROGRESS', async () => {
      // Commande existante avec statut PAID
      const sampleCommand: any = {
        id: '1',
        status: CommandStatus.PAID,
        meta_data: {},
        shipping_charge: 0,
      };
      // On simule la récupération de la commande
      commandRepository.findOneOrFail.mockResolvedValue(sampleCommand);
      commandRepository.save.mockResolvedValue(sampleCommand);

      const updateDto = {
        new_status: CommandStatus.IN_PROGRESS,
        shipping_charge: 5,
      };

      const response = await service.updateCommandStatus('1', updateDto);

      // Vérifier que la mise à jour du statut et la présence du shipping_charge ont été prises en compte
      expect(sampleCommand.status).toEqual(CommandStatus.IN_PROGRESS);
      expect(sampleCommand.shipping_charge).toEqual(5);
      expect(sampleCommand.meta_data.validated_at).toBeInstanceOf(Date);
      expect(commandRepository.save).toHaveBeenCalledWith(sampleCommand);
      expect(response.message).toEqual('Command updated successfully');
    });

    it('should throw BadRequestException if shipping_charge is missing when transitioning to IN_PROGRESS', async () => {
      const sampleCommand: any = {
        id: '1',
        status: CommandStatus.PAID,
        meta_data: {},
        shipping_charge: 0,
      };
      commandRepository.findOneOrFail.mockResolvedValue(sampleCommand);

      const updateDto = {
        new_status: CommandStatus.IN_PROGRESS,
        // shipping_charge manquant
      };

      await expect(
        service.updateCommandStatus('1', updateDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const sampleCommand: any = {
        id: '1',
        status: CommandStatus.PAID,
        meta_data: {},
        shipping_charge: 0,
      };
      commandRepository.findOneOrFail.mockResolvedValue(sampleCommand);

      // Tenter de passer directement de PAID à SHIPPED (transition non autorisée)
      const updateDto = {
        new_status: CommandStatus.SHIPPED,
      };

      await expect(
        service.updateCommandStatus('1', updateDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCommandsByCustomerId', () => {
    it('should return commands for a given customerId', async () => {
      const sampleCommands = [
        { id: '1', status: CommandStatus.PAID, user_id: 'cust1' },
        { id: '2', status: CommandStatus.DELIVERED, user_id: 'cust1' },
      ];
      commandRepository.find.mockResolvedValue(sampleCommands);

      const response = await service.getCommandsByCustomerId('cust1');

      expect(commandRepository.find).toHaveBeenCalledWith({
        where: {
          user_id: 'cust1',
          status: expect.anything(), // on ne vérifie pas précisément ici le filtre sur In(...)
        },
        order: { id: 'DESC' },
        take: 10,
      });
      expect(response.data).toHaveLength(2);
      expect(response.message).toEqual('Commands retrieved successfully');
    });
  });
});
