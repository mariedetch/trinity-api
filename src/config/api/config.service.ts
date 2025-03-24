import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get globalPrefix(): string {
    return this.configService.get<string>('api.globalPrefix');
  }

  get rateLimit() {
    return this.configService.get('api.rateLimit');
  }

  get cors() {
    return this.configService.get('api.cors');
  }

  get pagination() {
    return this.configService.get('api.pagination');
  }

  get paypalApiUrl() {
    return this.configService.get('api.aggregators.paypal.api_url');
  }

  get paypalClientId() {
    return this.configService.get('api.aggregators.paypal.client_id');
  }

  get paypalSecretKey() {
    return this.configService.get('api.aggregators.paypal.secret_key');
  }
}
