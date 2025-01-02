import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { doubleCsrf } from 'csrf-csrf';

@Injectable()
export class CsrfConfigService {
  private tokenGenerator;

  constructor(private configService: ConfigService) {
    const { generateToken } = doubleCsrf({
      getSecret: () => this.configService.get<string>('csrf.secret'),
      cookieName:
        this.configService.get<string>('csrf.cookieName') ||
        '__Host-psifi.x-csrf-token',
      cookieOptions: {
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    });
    this.tokenGenerator = generateToken;
  }

  generateToken(): string {
    return this.tokenGenerator();
  }
}
