import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enum';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const fixedDate = new Date('2025-01-13T19:41:03.272Z');

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: Role.MANAGER,
    phonenumber: '1234567890',
    password: 'hashedpassword',
    commands: [],
    payment_methods: [],
    addresses: [],
    createdAt: fixedDate,
    updatedAt: fixedDate,
    setPassword: function (password: string): Promise<void> {
      return
    }
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: Role.MANAGER,
    phonenumber: '1234567890',
    password: 'hashedpassword',
    payment_methods: [],
    addresses: [],
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    const mockRepository = {
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
      findOneBy: jest.fn().mockResolvedValue(mockUser),
      findOneByOrFail: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockResolvedValue([mockUser]),
      findAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      preload: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual({
        status_code: 201,
        message: 'User created successfully',
        data: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        status_code: 200,
        message: 'Users retrieved successfully',
        data: {
          items: [expect.any(Object)],
          total: 1,
          currentPage: 1,
          perPage: 10,
        },
        timestamp: expect.any(String),
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne('1');

      expect(result).toEqual({
        status_code: 200,
        message: 'User retrieved successfully',
        data: expect.objectContaining({
          id: mockUser.id,
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: UpdateUserDto = { first_name: 'Jane' };
      const result = await service.update('1', updateDto);

      expect(result).toEqual({
        status_code: 200,
        message: 'User updated successfully',
        data: expect.objectContaining({
          id: mockUser.id,
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await service.remove('1');

      expect(result).toEqual({
        status_code: 200,
        message: 'User removed successfully',
        data: null,
        timestamp: expect.any(String),
      });
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: [
          'id',
          'first_name',
          'last_name',
          'role',
          'phonenumber',
          'email',
          'password',
          'payment_methods',
          'addresses',
        ],
      });
    });
  });
});
