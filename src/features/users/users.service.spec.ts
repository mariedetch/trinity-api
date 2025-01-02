import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enum';

describe('UsersService', () => {
  let service: UsersService;
  let repository: DeepMockProxy<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockDeep<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: Role.MANAGER,
      phonenumber: '1234567890',
      password: 'hashedpassword',
      payment_methods: [],
      addresses: [],
    };

    const mockUser = {
      id: '1',
      ...createUserDto,
    } as User;

    repository.create.mockReturnValue(mockUser);
    repository.save.mockResolvedValue(mockUser);

    const result = await service.create(createUserDto);
    expect(result).toBeDefined();
    expect(result.data).toEqual(mockUser);
    expect(repository.create).toHaveBeenCalledWith(createUserDto);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should find a user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: '1',
      email,
      first_name: 'John',
      last_name: 'Doe',
      role: Role.MANAGER,
      phonenumber: '1234567890',
      password: 'hashedpassword',
      payment_methods: [],
      addresses: [],
    } as User;

    repository.findOne.mockResolvedValue(mockUser);

    const result = await service.findByEmail(email);
    expect(result).toEqual(mockUser); // Teste que la méthode retourne le bon utilisateur
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(repository.findOne).toHaveBeenCalledTimes(1);
  });
});
