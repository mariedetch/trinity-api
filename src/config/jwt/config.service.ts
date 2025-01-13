import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>('jwt.secret');
  }

  get expiresIn(): string {
    return this.configService.get<string>('jwt.expiresIn') || '15m';
  }
}
