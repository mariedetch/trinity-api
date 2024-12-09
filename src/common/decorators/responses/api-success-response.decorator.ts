import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { JsonResponse } from 'src/common/helpers/json-response.helper';

export class ApiSuccessResponseDto<TData> implements JsonResponse<TData> {
  @ApiProperty()
  status_code: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: TData;
}

interface ApiSuccessResponseOptions<TModel> {
  model: TModel;
  type?: string;
  description?: string;
  responseType?: any;
}

export const ApiSuccessResponse = <TModel extends Type<any>>(
  options: ApiSuccessResponseOptions<TModel>,
) => {
  const {
    model,
    type = 'object',
    description,
    responseType = ApiOkResponse,
  } = options;

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, model),
    responseType({
      description,
      schema: {
        title: `ApiSuccessResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: getDataSchema(type, model),
            },
          },
        ],
      },
    }),
  );
};

export function getDataSchema(type: string, model): object {
  if (type === 'object') {
    return {
      $ref: getSchemaPath(model),
    };
  }

  return {
    type: type,
    items: { $ref: getSchemaPath(model) },
  };
}
