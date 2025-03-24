import { BadRequestException } from '@nestjs/common';

export class InsuffisantStockException extends BadRequestException {
  constructor(
    message: string = 'Insufficient stock available to complete the request.',
  ) {
    super(message);
  }
}
