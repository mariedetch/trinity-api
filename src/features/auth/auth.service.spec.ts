import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { Request, Response } from 'express';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'mock_user_id',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'MANAGER',
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
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtConfigService, useValue: jwtConfigServiceMock },
        { provide: CsrfConfigService, useValue: csrfConfigServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user credentials and return the user', async () => {
      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      usersServiceMock.findByEmail.mockResolvedValueOnce(null);
      await expect(
        service.validateUser('invalid@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const csrfToken = 'mock_csrf_token';
      const userDto = { ...mockUser } as UserDto;
      const result = service.generateAccessToken(userDto, csrfToken);

      expect(result.access_token).toBe('mock_access_token');
      expect(result.csrf_token).toBe(csrfToken);
      expect(result.token_type).toBe('Bearer');
    });
  });

  describe('login', () => {
    it('should log in user and return a token', async () => {
      const req = {} as Request;
      const res = {} as Response;
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const response = await service.login(req, res, loginDto);

      expect(response.data.access_token).toBe('mock_access_token');
      expect(response.message).toBe('User successfully logged in');
    });
  });

  // describe('refreshToken', () => {
  //   it('should refresh token and return new access token', async () => {
  //     // Configure mock pour retourner un jeton valide
  //     jwtServiceMock.verify.mockReturnValueOnce({
  //       sub: mockUser.id,
  //       email: mockUser.email,
  //       role: mockUser.role,
  //     });

  //     const req = {} as Request;
  //     const res = {} as Response;

  //     // Appeler la méthode refreshToken
  //     const response = await service.refreshToken(
  //       req,
  //       res,
  //       'mock_refresh_token',
  //     );

  //     // Assertions
  //     expect(response.data.access_token).toBe('mock_access_token');
  //     expect(response.message).toBe('Token successfully refreshed');
  //   });

  //   it('should throw UnauthorizedException for invalid refresh token', async () => {
  //     // Configure mock pour jeter une exception
  //     jwtServiceMock.verify.mockImplementationOnce(() => {
  //       throw new UnauthorizedException('Invalid token');
  //     });

  //     const req = {} as Request;
  //     const res = {} as Response;

  //     await expect(
  //       service.refreshToken(req, res, 'invalid_token'),
  //     ).rejects.toThrow(UnauthorizedException);
  //   });
  // });

  // describe('getAuthUser', () => {
  //   it('should return the authenticated user', async () => {
  //     usersServiceMock.findOne.mockResolvedValueOnce(mockUser);

  //     const response = await service.getAuthUser({ sub: mockUser.id });
  //     expect(response.data.email).toBe('test@example.com');
  //   });

  //   it('should throw UnauthorizedException if token is invalid', async () => {
  //     usersServiceMock.findOne.mockResolvedValueOnce(null);

  //     await expect(service.getAuthUser({ sub: 'invalid_id' })).rejects.toThrow(
  //       UnauthorizedException,
  //     );
  //   });
  // });

  describe('logout', () => {
    it('should log out user and revoke token', async () => {
      const response = await service.logout({ sub: mockUser.id });
      expect(response.message).toBe('User successfully logged out');
    });
  });
});
