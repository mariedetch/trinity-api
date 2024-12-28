import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  successResponse,
  JsonResponse,
} from '../../../src/common/helpers/json-response.helper';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dto/user.dto';
import { CsrfConfigService } from '../../core/services/config/csrf-config.service';
import { JwtConfigService } from '../../../src/core/services/config/jwt-config.service';

@Injectable()
export class AuthService {
  private revokedTokens: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    private csrfConfigService: CsrfConfigService,
    private jwtConfigService: JwtConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.data.password))) {
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
      access_token: this.jwtConfigService.sign(payload),
      csrf_token: csrf_token,
      token_type: 'Bearer',
      expired_in: 3600,
      user: plainToClass(UserDto, user),
    };

    return data;
  }

  async login({
    email,
    password,
  }: LoginUserDto): Promise<JsonResponse<LoginResponseDto>> {
    const user = await this.validateUser(email, password);

    const csrf_token = this.csrfConfigService.generateToken();

    const data = this.generateAccessToken(user.data, csrf_token);

    return successResponse(data, `User successfully logged in`, 201);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<JsonResponse<LoginResponseDto>> {
    try {
      const payload = this.jwtConfigService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const csrf_token = this.csrfConfigService.generateToken();
      const data = this.generateAccessToken(user.data, csrf_token);

      return successResponse(
        plainToClass(LoginResponseDto, data),
        `Token successfully refreshed`,
        201,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getAuthUser(token: string): Promise<JsonResponse<UserDto>> {
    try {
      const payload = await this.jwtConfigService.verifyAsync(token);

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return successResponse(
        plainToClass(UserDto, user),
        `User successfully gotten`,
        201,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(access_token: string): Promise<JsonResponse<any>> {
    try {
      if (this.revokedTokens.has(access_token)) {
        throw new UnauthorizedException('Token already revoked');
      }
      this.revokedTokens.add(access_token);

      this.cleanupRevokedTokens();

      return successResponse(null, 'Successfully logged out', 200);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private cleanupRevokedTokens(): void {
    const now = new Date();
    for (const token of this.revokedTokens) {
      try {
        const payload = this.jwtConfigService.verify(token);
        if (payload.exp * 1000 < now.getTime()) {
          this.revokedTokens.delete(token);
        }
      } catch {
        this.revokedTokens.delete(token);
      }
    }
  }
}
