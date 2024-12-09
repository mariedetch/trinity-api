import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiConfigService } from 'src/config/api/config.service';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly apiConfigService: ApiConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const corsConfig = this.apiConfigService.cors;
    res.header('Access-Control-Allow-Origin', corsConfig.origin);
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,OPTIONS,POST,PUT,DELETE',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }
}
