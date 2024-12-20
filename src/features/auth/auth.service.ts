import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.data.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.data.id,
      email: user.data.email,
      role: user.data.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
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
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
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
          phone_number: user.data.phonenumber,
          role: user.data.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
