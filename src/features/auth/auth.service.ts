import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  successResponse,
  JsonResponse,
} from 'src/common/helpers/json-response.helper';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dto/user.dto';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly revokedTokens: Set<string>;

  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,
    private csrfConfigService: CsrfConfigService,
    private jwtConfigService: JwtConfigService,
  ) {
    this.revokedTokens = new Set();
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  generateAccessToken(user: UserDto, csrf_token: string): LoginResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const data: LoginResponseDto = {
      access_token: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.secret,
        expiresIn: this.jwtConfigService.expiresIn,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.secret,
        expiresIn: '7d',
      }),
      csrf_token: csrf_token,
      token_type: 'Bearer',
      expired_in: 3600,
      user: plainToClass(UserDto, user),
    };

    return data;
  }

  getTokenFromHeader(authHeader: string): string {
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }

  async login(
    req: ExpressRequest,
    res: Response,
    { email, password }: LoginUserDto,
  ): Promise<JsonResponse<LoginResponseDto>> {
    const user = await this.validateUser(email, password);

    const csrf_token = this.csrfConfigService.generateToken(req, res);

    const data = this.generateAccessToken(user, csrf_token);

    return successResponse(data, `User successfully logged in`, 200);
  }

  async refreshToken(
    req: ExpressRequest,
    res: Response,
    refreshToken: string,
  ): Promise<JsonResponse<LoginResponseDto>> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfigService.secret,
      });
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const csrf_token = this.csrfConfigService.generateToken(req, res);
      const data = this.generateAccessToken(user.data, csrf_token);

      return successResponse(
        plainToClass(LoginResponseDto, data),
        `Token successfully refreshed`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getAuthUser(payload: any): Promise<JsonResponse<UserDto>> {
    try {
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      return successResponse(
        plainToClass(UserDto, user.data),
        `User successfully gotten`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(payload: any): Promise<JsonResponse<null>> {
    try {
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const tokenId = payload.sub + '_' + Date.now();
      this.revokedTokens.add(tokenId);

      this.cleanupRevokedTokens();

      return successResponse(null, 'User successfully logged out', 200);
    } catch (error) {
      throw new UnauthorizedException('Invalid user or session');
    }
  }

  public cleanupRevokedTokens(): void {
    const MAX_REVOKED_TOKENS = 1000;
    if (this.revokedTokens.size > MAX_REVOKED_TOKENS) {
      const tokensArray = Array.from(this.revokedTokens);
      const tokensToRemove = tokensArray.slice(
        0,
        tokensArray.length - MAX_REVOKED_TOKENS,
      );
      tokensToRemove.forEach((token) => this.revokedTokens.delete(token));
    }
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
}
