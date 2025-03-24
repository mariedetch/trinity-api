import { AbstractCrudService } from 'src/core/services/abstract-crud.service';
import { Payment } from './payment.entity';
import { PaymentDto } from './dto/payment.dto';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { PayPalService } from 'src/core/aggregators/paypal/paypal.service';
import { CommandsService } from '../commands/commands.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandStatus } from '../commands/enums';
import { BadRequestException, Logger } from '@nestjs/common';
import { CommandPaidEvent } from 'src/features/commands/events/command-paid.event';
import { PaymentMethod } from './payment.enum';
import { CreatePaymentOrderResponse } from 'src/core/aggregators/paypal/dto/create-payment-order.dto';

export class PaymentService extends AbstractCrudService<
  Payment,
  PaymentDto,
  PaymentDto,
  PaymentDto
> {
  entityName: string = 'Payment';
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    readonly repository: Repository<Payment>,
    private readonly commandService: CommandsService,
    private readonly paypalService: PayPalService,
    private eventEmitter: EventEmitter2,
  ) {
    super(repository);
  }

  convertToDto(entity: Payment | Payment[]): PaymentDto[] {
    if (!Array.isArray(entity)) {
      entity = [entity];
    }
    return entity.map((e) => plainToClass(PaymentDto, e));
  }

  /**
   * Initiates a PayPal payment for a given command.
   *
   * @param commandId - The ID of the command to initiate the payment for.
   * @returns A JsonResponse containing the response from PayPal's create payment order API.
   */
  async initiatePaypalPayment(
    commandId: string,
  ): Promise<JsonResponse<CreatePaymentOrderResponse>> {
    const command = await this.commandService.findCommandById(commandId, [
      'user',
      'command_products',
      'command_products.product',
    ]);
    if (command.status != CommandStatus.VALIDATED) {
      throw new BadRequestException(
        'The command is not in the checkout process or is already paid',
      );
    }

    const response = await this.paypalService.initiatePayment(
      this.paypalService.buildCreatePaymentOrderRequest(command),
    );

    return successResponse(response, 'Payment initiated successfully');
  }

  /**
   * Captures a PayPal payment for a given order and command.
   *
   * @param orderId - The ID of the PayPal order to capture the payment for.
   * @param commandId - The ID of the command associated with the payment.
   * @returns A JsonResponse indicating the success of the payment capture.
   */
  async capturePaypalPayment(
    orderId: string,
    commandId: string,
  ): Promise<JsonResponse<void>> {
    const command = await this.commandService.findCommandById(commandId, [
      'user',
    ]);
    if (command.status != CommandStatus.VALIDATED) {
      throw new BadRequestException(
        'The command is not in the checkout process or is already paid',
      );
    }

    const isComplete = await this.paypalService.capturePayment(orderId);
    if (!isComplete) {
      throw new BadRequestException('Payment not completed');
    }
    const orderEvent = new CommandPaidEvent();
    orderEvent.command = command;
    orderEvent.method = PaymentMethod.PAYPAL;

    this.eventEmitter.emit('order.paid', orderEvent);

    return successResponse(null, 'Payment complete successfully');
  }

  /**
   * Retrieves a paginated list of payments.
   *
   * @param page - The page number to retrieve.
   * @param perPage - The number of items per page.
   * @returns A JsonResponse containing a PaginationResource of PaymentDto.
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<JsonResponse<PaginationResource<PaymentDto>>> {
    const [entities, total] = await this.repository.findAndCount({
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
      order: { createdAt: 'DESC' },
      relations: ['customer', 'command'],
    });
    const result: PaginationResource<PaymentDto> = {
      items: this.convertToDto(entities),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(
      result,
      `${this.entityName}s retrieved successfully`,
    );
  }
}
