import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from 'src/common/helpers/json-response.helper';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    let message = exception.message || 'Internal server error';
    let error = exception.name;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = exceptionResponse['message'] || message;
      error = exceptionResponse['error'] || error;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    response.status(status).json(errorResponse(error, message, status));
  }
}
