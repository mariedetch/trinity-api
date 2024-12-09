import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiMethodNotAllowedResponse,
  ApiUnprocessableEntityResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from './api-error-response.decorator';

export function ApiDefaultErrorResponse() {
  return applyDecorators(
    ApiErrorResponse(ApiBadRequestResponse, 'Bad Request'),
    ApiErrorResponse(
      ApiUnauthorizedResponse,
      'The user is not authentificated.',
    ),
    ApiErrorResponse(ApiNotFoundResponse, 'Not Found'),
    ApiErrorResponse(ApiForbiddenResponse, 'Forbidden'),
    ApiErrorResponse(ApiMethodNotAllowedResponse, 'Method Not Allowed'),
    ApiErrorResponse(ApiUnprocessableEntityResponse, 'Unprocessable Entity'),
    ApiErrorResponse(ApiInternalServerErrorResponse, 'Internal Server Error'),
  );
}
