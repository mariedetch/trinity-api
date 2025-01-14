import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Role } from 'src/features/users/enum';
import { UserDto } from 'src/features/users/dto/user.dto';
import { Request, Response } from 'express';
import { JsonResponse } from 'src/common/helpers/json-response.helper';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthService>;
  let jwtServiceMock: Partial<JwtService>;

  // Mock Request et Response
  const mockRequest = {
    // Ajoutez les propriétés dont vous avez besoin
  } as Request;

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockUserResponse: JsonResponse<LoginResponseDto> = {
    status_code: 200,
    message: 'User logged in successfully',
    timestamp: new Date().toDateString(),
    data: {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      csrf_token: 'mock_csrf_token',
      token_type: 'Bearer',
      expired_in: 3600,
      user: {
        id: 'mock_user_id',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.MANAGER,
      } as UserDto,
    },
  };

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn().mockResolvedValue(mockUserResponse),
      refreshToken: jest.fn().mockResolvedValue(mockUserResponse),
      getAuthUser: jest.fn().mockResolvedValue(mockUserResponse),
      logout: jest.fn().mockResolvedValue({
        statusCode: 200,
        message: 'Successfully logged out',
      }),
      getTokenFromHeader: jest.fn().mockReturnValue('mock_access_token'),
    };

    jwtServiceMock = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'mock_user_id',
        email: 'mock@example.com',
        role: Role.MANAGER,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'mock_secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: JwtConfigService, useValue: { secret: 'mock_secret' } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(
        mockRequest,
        mockResponse,
        loginUserDto,
      );

      expect(result).toEqual(mockUserResponse);
      expect(authServiceMock.login).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        {
          email: 'test@example.com',
          password: 'password123',
        },
      );
    });
  });

  describe('refreshToken', () => {
    it('should return refresh token response', async () => {
      const refreshToken = 'Bearer mock_refresh_token';

      const result = await controller.refreshToken(
        mockRequest,
        mockResponse,
        refreshToken,
      );

      expect(result).toEqual(mockUserResponse);
      expect(authServiceMock.refreshToken).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        'mock_access_token',
      );
    });
  });

  describe('getAuthUser', () => {
    it('should return authenticated user data', async () => {
      const authHeader = 'Bearer mock_access_token';
      const result = await controller.getAuthUser(authHeader);

      expect(result).toEqual(mockUserResponse);
      expect(authServiceMock.getAuthUser).toHaveBeenCalledWith(
        'mock_access_token',
      );
    });
  });

  describe('logout', () => {
    it('should return logout success message', async () => {
      const authHeader = 'Bearer mock_access_token';
      const result = await controller.logout(authHeader);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Successfully logged out',
      });
      expect(authServiceMock.logout).toHaveBeenCalledWith('mock_access_token');
    });
  });
});
