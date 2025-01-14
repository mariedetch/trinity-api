import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { JsonResponse } from 'src/common/helpers/json-response.helper';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'mock_user_id',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'MANAGER',
    password: 'hashedpassword',
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
      role: 'MANAGER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })),
    verifyAsync: jest.fn(async (token: string) => ({
      sub: 'mock_user_id',
      email: 'test@example.com',
      role: 'MANAGER',
    })),
  };

  const mockRequest = {
    headers: {},
    cookies: {},
  } as any;

  const mockResponse = {
    cookie: jest.fn(),
  } as any;

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user credentials successfully', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toEqual(mockUser);
    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    usersServiceMock.findByEmail.mockResolvedValueOnce(null);
    await expect(
      service.validateUser('wrong@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should log in a user and return tokens', async () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const response = await service.login(mockRequest, mockResponse, loginDto);

    expect(response.data.access_token).toBe('mock_access_token');
    expect(response.message).toBe('User successfully logged in');
    expect(csrfConfigServiceMock.generateToken).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    jwtServiceMock.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await expect(
      service.refreshToken(mockRequest, mockResponse, 'invalid_token'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should log out a user and revoke the token', async () => {
    const response = await service.logout('mock_access_token');
    expect(response.message).toBe('Successfully logged out');
    expect(service['revokedTokens'].has('mock_access_token')).toBe(true);
  });

  it('should return authenticated user from token', async () => {
    const response = await service.getAuthUser('mock_access_token');
    expect(response.data.email).toBe('test@example.com');
  });

  it('should throw UnauthorizedException for invalid token in getAuthUser', async () => {
    jwtServiceMock.verifyAsync.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await expect(service.getAuthUser('invalid_token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should clean up expired revoked tokens', () => {
    const oldToken = 'expired_token';
    service['revokedTokens'].add(oldToken);

    jest.spyOn(jwtServiceMock, 'verify').mockImplementation(() => {
      throw new Error('Token expired');
    });

    service['cleanupRevokedTokens']();
    expect(service['revokedTokens'].has(oldToken)).toBe(false);
  });
});
