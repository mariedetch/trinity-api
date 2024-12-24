import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private revokedTokens: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const saltOrRounds = 10;
    const givenPassword = await bcrypt.hash(password, saltOrRounds);

    if (!user || !(await bcrypt.compare(givenPassword, user.data.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string, req: any) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.data.id,
      email: user.data.email,
      role: user.data.role,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      }),
      csrfToken: req.csrfToken(),
      token_type: 'Bearer',
      expired_in: 3600,
      user: {
        first_name: user.data.first_name,
        last_name: user.data.last_name,
        email: user.data.email,
        phone_number: user.data.phonenumber,
        role: user.data.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findOne(payload.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.jwtService.sign(
        { userId: user.data.id, role: user.data.role },
        {
          expiresIn: '1h',
        },
      );

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          first_name: user.data.first_name,
          last_name: user.data.last_name,
          email: user.data.email,
          phonenumber: user.data.phonenumber,
          role: user.data.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getAuthUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.data.id,
        first_name: user.data.first_name,
        last_name: user.data.last_name,
        email: user.data.email,
        phonenumber: user.data.phonenumber,
        role: user.data.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logout(token: string, req: any) {
    this.revokedTokens.add(token);
    req.session.destroy((err) => {
      if (err) {
        throw new UnauthorizedException('Failed to destroy session');
      }
    });
    req.csrfToken();
    return {
      message: 'Successfully logged out',
    };
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
}
