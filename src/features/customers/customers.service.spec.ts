import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Role } from '../users/enum';

describe('CustomersService', () => {
  let service: CustomersService;
  let repositoryMock: Partial<Repository<User>>;

  beforeEach(async () => {
    repositoryMock = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should retrieve a paginated list of customers', async () => {
      const mockCustomers = [
        { id: '1', first_name: 'John', last_name: 'Doe', role: Role.CUSTOMER },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          role: Role.CUSTOMER,
        },
      ];
      const total = 2;

      (repositoryMock.findAndCount as jest.Mock).mockResolvedValueOnce([
        mockCustomers,
        total,
      ]);

      const page = 1;
      const perPage = 10;

      const result = await service.findAll(page, perPage);

      expect(repositoryMock.findAndCount).toHaveBeenCalledWith({
        where: { role: Role.CUSTOMER },
        skip: 0,
        take: perPage,
      });
      expect(result.data.items).toEqual(mockCustomers);
      expect(result.data.total).toBe(total);
      expect(result.message).toBe('Customers retrieved successfully');
    });
  });

  describe('findOne', () => {
    it('should retrieve a specific customer by ID', async () => {
      const mockCustomer = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.CUSTOMER,
      };

      (repositoryMock.findOne as jest.Mock).mockResolvedValueOnce(mockCustomer);

      const result = await service.findOne('1');

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: '1', role: Role.CUSTOMER },
      });
      expect(result.data).toEqual(mockCustomer);
      expect(result.message).toBe('Customer retrieved successfully');
    });

    it('should return null if the customer is not found', async () => {
      (repositoryMock.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.findOne('non-existent-id');

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id', role: Role.CUSTOMER },
      });
      expect(result.data).toBeNull();
    });
  });
});
