import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { SupplyDto } from './dto/supply.dto';
import { ProductDto } from 'src/features/products/dto/product.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Role } from '../users/enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';

@Controller({ path: 'supplies', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiOperation({ summary: 'Create a new supply' })
  @ApiBody({
    type: [CreateSupplyDto],
    description: 'Array of supplies to create',
  })
  create(
    @Body() createSupplyDto: CreateSupplyDto[],
  ): Promise<JsonResponse<SupplyDto>> {
    return this.suppliesService.createSupply(createSupplyDto);
  }

  @Get(':id/items')
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The supply product has been successfully retieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiOperation({ summary: 'Retrive all the supply products' })
  findAllProduct(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<PaginationResource<ProductDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    return this.suppliesService.findAllProduct(currentPage, itemsPerPage, id);
  }

  @Get()
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: SupplyDto,
    description: 'The supplies has been successfully retieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiOperation({ summary: 'Retrive all the supplies' })
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<JsonResponse<PaginationResource<SupplyDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    return this.suppliesService.findAll(currentPage, itemsPerPage);
  }
}
