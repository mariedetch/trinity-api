import { AbstractCrudService } from "src/core/services/abstract-crud.service";
import { Payment } from "./payment.entity";
import { PaymentDto } from "./dto/payment.dto";
import { plainToClass } from "class-transformer";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JsonResponse, successResponse } from "src/common/helpers/json-response.helper";
import { PaginationResource } from "src/core/interfaces/pagination-resource.interface";

export class PaymentService extends AbstractCrudService<Payment, PaymentDto, PaymentDto, PaymentDto> {
  entityName: string = 'Payment';

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>
  ) {
    super(paymentRepository);
  }

  convertToDto(entity: Payment | Payment[]): PaymentDto[] {
    if (!Array.isArray(entity)) {
      entity = [entity];
    }
    return entity.map(e => plainToClass(PaymentDto, e));
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<JsonResponse<PaginationResource<PaymentDto>>> {
    const [entities, total] = await this.repository.findAndCount({
      skip: ((page <= 0 ? 1 : page) - 1) * perPage,
      take: perPage,
      order: { createdAt: 'DESC' },
      relations: ['customer', 'command']
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