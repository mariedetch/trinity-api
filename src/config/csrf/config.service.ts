import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { doubleCsrf } from 'csrf-csrf';
import { Request as ExpressRequest, Response } from 'express';

@Injectable()
export class CsrfConfigService {
  private csrfProtection;

  constructor(private configService: ConfigService) {
    const { generateToken, doubleCsrfProtection } = doubleCsrf({
      getSecret: () => this.configService.get<string>('csrf.secret'),
      cookieName: '__Host-psifi.x-csrf-token',
      cookieOptions: {
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    });

    this.csrfProtection = {
      generateToken,
      doubleCsrfProtection,
    };
  }

  generateToken(req: ExpressRequest, res: Response): string {
    return this.csrfProtection.generateToken(req, res);
  }
}
