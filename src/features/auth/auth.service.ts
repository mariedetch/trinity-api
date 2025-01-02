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
} from '../../../src/common/helpers/json-response.helper';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dto/user.dto';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private revokedTokens: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,
    private csrfConfigService: CsrfConfigService,
    private jwtConfigService: JwtConfigService,
  ) {}

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

  async login({
    email,
    password,
  }: LoginUserDto): Promise<JsonResponse<LoginResponseDto>> {
    const user = await this.validateUser(email, password);

    const csrf_token = this.csrfConfigService.generateToken();

    const data = this.generateAccessToken(user, csrf_token);

    return successResponse(data, `User successfully logged in`, 200);
  }

  async refreshToken(
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

      const csrf_token = this.csrfConfigService.generateToken();
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

  async getAuthUser(token: string): Promise<JsonResponse<UserDto>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfigService.secret,
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      return successResponse(
        plainToClass(UserDto, user),
        `User successfully gotten`,
        200,
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
        const payload = this.jwtService.verify(token, {
          secret: this.jwtConfigService.secret,
        });
        if (payload.exp * 1000 < now.getTime()) {
          this.revokedTokens.delete(token);
        }
      } catch {
        this.revokedTokens.delete(token);
      }
    }
  }
}
