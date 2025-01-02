import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Role } from '../users/enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedpassword'),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'mock_user_id',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: Role.MANAGER,
    phonenumber: '1234567890',
    password: 'hashedpassword',
    payment_methods: [],
    addresses: [],
  };

  const usersServiceMock = {
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  const jwtConfigServiceMock = {
    secret: 'mock_secret',
    expiresIn: '3600s',
  };

  const csrfConfigServiceMock = {
    generateToken: jest.fn().mockReturnValue('mockCsrfToken'),
  };

  const jwtServiceMock = {
    sign: jest.fn(() => 'mock_access_token'),
    verify: jest.fn((token: string) => ({
      sub: 'mock_user_id',
      email: 'test@example.com',
      role: 'CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })),
    verifyAsync: jest.fn(async (token: string) => ({
      sub: 'mock_user_id',
      email: 'test@example.com',
      role: 'CUSTOMER',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: CsrfConfigService, useValue: csrfConfigServiceMock },
        { provide: JwtConfigService, useValue: jwtConfigServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user credentials and return a user', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toEqual(mockUser);
    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should throw UnauthorizedException if user credentials are invalid', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce(null);
    await expect(
      service.validateUser('invalid@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should generate access token', () => {
    const csrfToken = 'mock_csrf_token';
    const result = service.generateAccessToken(mockUser, csrfToken);

    expect(result.access_token).toBe('mock_access_token');
    expect(result.csrf_token).toBe(csrfToken);
    expect(result.token_type).toBe('Bearer');
  });

  it('should log in user and return a token', async () => {
    const loginDto = { email: 'test@example.com', password: 'password' };
    const response = await service.login(loginDto);

    expect(response.data.access_token).toBe('mock_access_token');
    expect(response.message).toBe('User successfully logged in');
  });

  it('should refresh token and return new access token', async () => {
    jwtServiceMock.verify.mockImplementationOnce((token: string) => {
      if (token === 'mock_refresh_token') {
        return {
          sub: 'mock_user_id',
          email: 'test@example.com',
          role: 'MANAGER',
          exp: Math.floor(Date.now() / 1000) + 3600,
        };
      }
      throw new UnauthorizedException('Invalid refresh token');
    });

    const response = await service.refreshToken('mock_refresh_token');

    expect(response.data.access_token).toBe('mock_access_token');
    expect(response.message).toBe('Token successfully refreshed');
  });

  it('should throw UnauthorizedException for invalid refresh token', async () => {
    jwtServiceMock.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await expect(service.refreshToken('invalid_token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should logout and revoke token', async () => {
    const response = await service.logout('mock_access_token');

    expect(response.message).toBe('Successfully logged out');
    expect(response.status_code).toBe(200);
  });

  it('should throw UnauthorizedException if token is already revoked', async () => {
    jwtServiceMock.verify.mockImplementationOnce(() => {
      throw new UnauthorizedException('Token already revoked');
    });

    await service.logout('mock_access_token');
    await expect(service.logout('mock_access_token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return authenticated user based on token', async () => {
    const response = await service.getAuthUser('mock_access_token');
    expect(response.data.email).toBe('test@example.com');
    expect(response.message).toBe('User successfully gotten');
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    jwtServiceMock.verifyAsync.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    await expect(service.getAuthUser('invalid_token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
