import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { JsonResponse } from 'src/common/helpers/json-response.helper';

export class ApiErrorResponseDto implements JsonResponse<any> {
  @ApiProperty()
  status_code: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error?: any;
}

export const ApiErrorResponse = (
  responseType: any = ApiOkResponse,
  description?: string,
) => {
  return applyDecorators(
    ApiExtraModels(ApiErrorResponseDto),
    responseType({
      description: description,
      schema: {
        allOf: [{ $ref: getSchemaPath(ApiErrorResponseDto) }],
      },
    }),
  );
};
