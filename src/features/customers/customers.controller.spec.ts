import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('CustomersController', () => {
  let controller: CustomersController;
  let serviceMock: Partial<CustomersService>;

  beforeEach(async () => {
    serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: serviceMock,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should call CustomersService.findOne with the correct ID', async () => {
      const mockCustomer = {
        data: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          role: 'CUSTOMER',
        },
        message: 'Customer retrieved successfully',
      };
      (serviceMock.findOne as jest.Mock).mockResolvedValueOnce(mockCustomer);

      const result = await controller.findOne('1');

      expect(serviceMock.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCustomer);
    });
  });
});
