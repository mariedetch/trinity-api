import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PayPalAuthService } from './paypal-auth.service';
import axios from 'axios';
import { ApiConfigService } from 'src/config/api/config.service';
import {
  CreatePaymentOrderDto,
  CreatePaymentOrderResponse,
  OrderResponseLink,
  PaymentOrderIntent,
} from './dto/create-payment-order.dto';
import { Command } from 'src/features/commands/command.entity';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);

  constructor(
    private readonly paypalAuthService: PayPalAuthService,
    private readonly apiConfigService: ApiConfigService,
  ) {}

  buildCreatePaymentOrderRequest(command: Command): CreatePaymentOrderDto {
    return {
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            landing_page: 'LOGIN',
            shipping_preference: 'GET_FROM_FILE',
            user_action: 'PAY_NOW',
            return_url: 'https://example.com/returnUrl',
            cancel_url: 'https://example.com/cancelUrl',
          },
        },
      },
      purchase_units: [
        {
          reference_id: command.id,
          custom_id: command.id,
          amount: {
            currency_code: 'USD',
            value: parseFloat(command.total_price_incl.toFixed(2)),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: parseFloat(command.total_price_incl.toFixed(2)),
              },
            },
          },
        },
      ],
    };
  }

  /**
   * Crée un paiement PayPal et retourne l'URL d'approbation.
   */
  async initiatePayment(
    data: CreatePaymentOrderDto,
  ): Promise<CreatePaymentOrderResponse> {
    const accessToken = await this.paypalAuthService.getAccessToken();

    try {
      const response = await axios.post<CreatePaymentOrderResponse>(
        `${this.apiConfigService.paypalApiUrl}/v2/checkout/orders`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(
          `Erreur lors de l'initiation du paiement PayPal: ${JSON.stringify(error.response.data)}`,
        );
        throw new BadRequestException(
          `Unable to initiate the payment, please try again`,
        );
      } else {
        this.logger.error(
          `Erreur lors de l'initiation du paiement PayPal: ${error.message}`,
        );
        throw new BadRequestException(
          'Unable to initiate the payment, please try again',
        );
      }
    }
  }

  /**
   * Capture un paiement après approbation de l'utilisateur.
   */
  async capturePayment(orderId: string): Promise<boolean> {
    const accessToken = await this.paypalAuthService.getAccessToken();

    try {
      const response = await axios.post(
        `${this.apiConfigService.paypalApiUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.status == 'COMPLETED';
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(
          `Erreur lors de la capture du paiement PayPal pour l'ID ${orderId}: ${JSON.stringify(error.response.data)}`,
        );
        throw new BadRequestException(`Unable to process the payment`);
      } else {
        this.logger.error(
          `Erreur lors de l'initiation du paiement PayPal: ${error.message}`,
        );
        throw new BadRequestException('Unable to process the payment');
      }
    }
  }
}
