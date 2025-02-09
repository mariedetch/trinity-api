import { Test, TestingModule } from '@nestjs/testing';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { CommandStatus } from './enums';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { JwtService } from '@nestjs/jwt';

describe('CommandsController', () => {
  let controller: CommandsController;
  let service: CommandsService;

  // Mock du service des commandes
  const mockCommandsService = {
    getCommandList: jest.fn(),
    getCommandStats: jest.fn(),
    getCommandById: jest.fn(),
    getCommandProducts: jest.fn(),
    updateCommandStatus: jest.fn(),
  };

  // Mock du service JWT pour l'authentification
  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  // Mock du service de configuration JWT
  const mockJwtConfigService = {
    createJwtOptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandsController],
      providers: [
        {
          provide: CommandsService,
          useValue: mockCommandsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: JwtConfigService,
          useValue: mockJwtConfigService,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<CommandsController>(CommandsController);
    service = module.get<CommandsService>(CommandsService);
  });

  // Vérifie que le contrôleur est bien initialisé
  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('getCommandList', () => {
    // Test de la récupération de la liste des commandes pour un client
    it('devrait retourner une liste paginée des commandes pour un client', async () => {
      // Préparation des données de test
      const mockRequest = {
        user: {
          sub: 'user123',
          role: 'CUSTOMER',
        },
      };

      const expectedResult = {
        success: true,
        data: {
          items: [],
          meta: {
            total: 0,
            page: 1,
            perPage: 10,
          },
        },
      };

      mockCommandsService.getCommandList.mockResolvedValue(expectedResult);

      // Exécution du test
      const result = await controller.getCommandList(
        mockRequest as any,
        '1',
        '10',
        CommandStatus.INITIATED,
        'customer1',
        '2024-01-01',
        '2024-01-31',
      );

      // Vérifications
      expect(service.getCommandList).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        status: CommandStatus.INITIATED,
        customer: 'customer1',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        user_id: 'user123',
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCommandStats', () => {
    // Test de la récupération des statistiques des commandes
    it('devrait retourner les statistiques des commandes', async () => {
      const expectedStats = {
        success: true,
        data: {
          total: 100,
          pending: 20,
          completed: 80,
        },
      };

      mockCommandsService.getCommandStats.mockResolvedValue(expectedStats);
      const result = await controller.getCommandStats();

      expect(service.getCommandStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getCommandDetails', () => {
    // Test de la récupération des détails d'une commande
    it("devrait retourner les détails d'une commande par son ID", async () => {
      const commandId = 'command123';
      const expectedCommand = {
        success: true,
        data: {
          id: commandId,
          status: CommandStatus.INITIATED,
        },
      };

      mockCommandsService.getCommandById.mockResolvedValue(expectedCommand);

      const result = await controller.getCommandDetails(commandId);

      expect(service.getCommandById).toHaveBeenCalledWith(commandId);
      expect(result).toEqual(expectedCommand);
    });
  });

  describe('getCommandProducts', () => {
    // Test de la récupération des produits d'une commande
    it("devrait retourner la liste des produits d'une commande", async () => {
      const commandId = 'command123';
      const expectedProducts = {
        success: true,
        data: [
          {
            id: 'product123',
            quantity: 2,
            unit_price_incl: 10.99,
            unit_price_excl: 9.99,
            total_price_incl: 21.98,
            total_price_excl: 19.98,
            product: {
              id: 'prod1',
              name: 'Test Product',
            },
          },
        ],
      };

      mockCommandsService.getCommandProducts.mockResolvedValue(
        expectedProducts,
      );

      const result = await controller.getCommandProducts(commandId);

      expect(service.getCommandProducts).toHaveBeenCalledWith(commandId);
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('updateCommandStatus', () => {
    // Test de la mise à jour du statut d'une commande
    it("devrait mettre à jour le statut d'une commande", async () => {
      const commandId = 'command123';
      const updateDto = {
        new_status: CommandStatus.IN_PROGRESS,
        shipping_charge: 10,
      };

      const expectedResult = {
        success: true,
        data: {
          id: commandId,
          status: CommandStatus.IN_PROGRESS,
        },
      };

      mockCommandsService.updateCommandStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateCommandStatus(commandId, updateDto);

      expect(service.updateCommandStatus).toHaveBeenCalledWith(
        commandId,
        updateDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
