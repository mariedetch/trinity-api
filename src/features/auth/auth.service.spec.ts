import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtConfigService } from '../../../src/core/services/config/jwt-config.service';
import { CsrfConfigService } from '../../../src/core/services/config/csrf-config.service';
import { Role } from '../users/enums/role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedpassword'),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    data: {
      id: 'mock_user_id',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: Role.MANAGER,
      phonenumber: '1234567890',
      password: 'hashedpassword',
      payment_methods: [],
      addresses: [],
    },
  };
  const usersServiceMock = {
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  const jwtConfigServiceMock = {
    sign: jest.fn((payload: any) => 'mock_access_token'),
    verify: jest.fn((token: string) => ({
      sub: 'mock_user_id',
      email: 'mock@example.com',
      role: 'USER',
    })),
    verifyAsync: jest.fn(async (token: string) => ({
      sub: 'mock_user_id',
      email: 'mock@example.com',
      role: 'USER',
    })),
  };

  const csrfConfigServiceMock = {
    generateToken: jest.fn().mockReturnValue('mockCsrfToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: CsrfConfigService, useValue: csrfConfigServiceMock },
        { provide: JwtConfigService, useValue: jwtConfigServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user credentials and return a user', async () => {
    const result = await service.validateUser('mock@example.com', 'password');
    expect(result).toEqual(mockUser);
    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
      'mock@example.com',
    );
  });

  it('should generate access token', () => {
    const csrfToken = 'mock_csrf_token';
    const result = service.generateAccessToken(mockUser.data, csrfToken);

    expect(result.access_token).toBe('mock_access_token');
    expect(result.csrf_token).toBe(csrfToken);
    expect(jwtConfigServiceMock.sign).toHaveBeenCalled();
  });

  it('should log in user and return a token', async () => {
    const loginDto = { email: 'mock@example.com', password: 'password' };
    const response = await service.login(loginDto);

    expect(response.data.access_token).toBe('mock_access_token');
    expect(response.message).toBe('User successfully logged in');
  });
});
