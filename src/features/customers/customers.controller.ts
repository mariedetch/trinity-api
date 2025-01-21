import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { UserDto } from '../users/dto/user.dto';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../users/enum';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('users/customers')
@ApiTags('Customers')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: UserDto,
    description: 'The customers has been successfully retieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<JsonResponse<PaginationResource<UserDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    return this.customersService.findAll(currentPage, itemsPerPage);
  }

  @Get(':id')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: UserDto,
    description: 'The customer has been successfully retieved.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<UserDto>> {
    return this.customersService.findOne(id);
  }
}
