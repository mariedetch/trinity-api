import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import axios from 'axios';
import { ApiConfigService } from 'src/config/api/config.service';

@Injectable()
export class PayPalAuthService {
  private readonly logger = new Logger(PayPalAuthService.name);

  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private readonly apiConfigService: ApiConfigService,
  ) {}

  /**
   * Génère un access token PayPal et le stocke dans le cache
   */
  async generateAccessToken() {
    try {
      const credentials = Buffer.from(
        `${this.apiConfigService.paypalClientId}:${this.apiConfigService.paypalSecretKey}`,
      ).toString('base64');

      const response = await axios.post(
        `${this.apiConfigService.paypalApiUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in * 1000 - 60; // Expiration en secondes

      // Stocker dans le cache (durée légèrement inférieure à expires_in)
      await this.cacheManager.set(
        'paypal_access_token',
        accessToken,
        expiresIn,
      );

      this.logger.log(
        `Token PayPal généré et stocké en cache (Exp: ${expiresIn}s)`,
      );
      return accessToken;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la génération du token PayPal: ${error}`,
      );
      throw new Error("Impossible d'obtenir le token PayPal");
    }
  }

  /**
   * Récupère le token PayPal depuis le cache, ou le régénère s'il n'existe pas.
   */
  async getAccessToken(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>(
      'paypal_access_token',
    );
    if (cachedToken) {
      this.logger.log('Token PayPal récupéré depuis le cache');
      return cachedToken;
    }
    this.logger.warn('Token PayPal absent du cache, génération en cours...');
    return this.generateAccessToken();
  }

  /**
   * Job programmé pour rafraîchir le token PayPal toutes les 8h
   */
  @Cron(CronExpression.EVERY_8_HOURS)
  async refreshAccessToken() {
    this.logger.log('Rafraîchissement automatique du token PayPal...');
    await this.generateAccessToken();
  }
}
