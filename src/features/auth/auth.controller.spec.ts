import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from '../users/enums/role.enum';
import { JwtConfigService } from '../../core/services/config/jwt-config.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthService>;

  const mockUserResponse = {
    data: {
      access_token: 'mock_access_token',
      csrf_token: 'mock_csrf_token',
      token_type: 'Bearer',
      expired_in: 3600,
      user: {
        id: 'mock_user_id',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.MANAGER,
      },
    },
    message: 'User successfully logged in',
    statusCode: 201,
  };

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn().mockResolvedValue(mockUserResponse),
      refreshToken: jest.fn().mockResolvedValue(mockUserResponse),
      getAuthUser: jest.fn().mockResolvedValue({
        data: {
          id: 'mock_user_id',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: Role.MANAGER,
        },
        message: 'User successfully retrieved',
        statusCode: 200,
      }),
      logout: jest.fn().mockResolvedValue({
        message: 'Successfully logged out',
        statusCode: 200,
      }),
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: JwtConfigService, useValue: jwtConfigServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should log in a user and return a token', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await controller.login(loginDto);

      expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('refreshToken', () => {
    it('should refresh a token', async () => {
      const refreshToken = 'mock_refresh_token';
      const result = await controller.refreshToken(refreshToken);

      expect(authServiceMock.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('getAuthUser', () => {
    it('should return the authenticated user', async () => {
      const authHeader = 'Bearer mock_access_token';
      const result = await controller.getAuthUser(authHeader);

      expect(authServiceMock.getAuthUser).toHaveBeenCalledWith(
        'mock_access_token',
      );
      expect(result).toEqual({
        data: {
          id: 'mock_user_id',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: Role.MANAGER,
        },
        message: 'User successfully retrieved',
        statusCode: 200,
      });
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const authHeader = 'Bearer mock_access_token';
      const result = await controller.logout(authHeader);

      expect(authServiceMock.logout).toHaveBeenCalledWith('mock_access_token');
      expect(result).toEqual({
        message: 'Successfully logged out',
        statusCode: 200,
      });
    });
  });
});
