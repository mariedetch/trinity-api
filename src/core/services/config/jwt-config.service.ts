import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService {
  private jwtSecret: string;
  private readonly expiresIn = '7j';

  constructor(
    private configService: ConfigService,
    private jwtService: NestJwtService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
  }

  sign(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string) {
    return this.jwtService.verify(token, {
      secret: this.jwtSecret,
    });
  }

  verifyAsync(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.jwtSecret,
    });
  }
}
