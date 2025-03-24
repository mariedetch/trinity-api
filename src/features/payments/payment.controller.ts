import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Role } from '../users/enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { PaymentService } from './payment.service';
import {
  CapturePaymentDto,
  InitiatePaymentDto,
  PaymentDto,
} from './dto/payment.dto';
import { PayPalService } from 'src/core/aggregators/paypal/paypal.service';

@Controller({ path: 'payments', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('payments')
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentService) {}

  /**
   * Route pour initier un paiement PayPal.
   */
  @Roles(Role.CUSTOMER)
  @Post('paypal/initiate')
  @ApiSuccessResponse({
    model: PaymentDto,
    description: 'The payments has been successfully initiated.',
  })
  async initiatePayment(@Body() body: InitiatePaymentDto) {
    return this.paymentsService.initiatePaypalPayment(body.commandId);
  }

  /**
   * Route pour capturer un paiement PayPal après validation.
   */
  @Post('paypal/capture')
  async capturePayment(@Body() body: CapturePaymentDto) {
    return this.paymentsService.capturePaypalPayment(
      body.orderId,
      body.commandId,
    );
  }

  @Get()
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: PaymentDto,
    description: 'The payments has been successfully retieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiOperation({ summary: 'Retrive all the payments' })
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<JsonResponse<PaginationResource<PaymentDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    return this.paymentsService.findAll(currentPage, itemsPerPage);
  }
}
