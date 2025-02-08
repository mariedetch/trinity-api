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
import { ApiTags, ApiQuery, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryDto } from './dto/inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ProductDto } from 'src/features/products/dto/product.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Role } from '../users/enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';

@Controller({ path: 'inventories', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Get(':id/items')
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The inventory product has been successfully retieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiOperation({ summary: 'Retrive all the inventory products' })
  findAllProduct(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<PaginationResource<ProductDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    return this.inventoriesService.findAllProduct(
      currentPage,
      itemsPerPage,
      id,
    );
  }

  @Get()
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: InventoryDto,
    description: 'The inventories has been successfully retieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiOperation({ summary: 'Retrive all the inventories' })
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<JsonResponse<PaginationResource<InventoryDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    return this.inventoriesService.findAll(currentPage, itemsPerPage);
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiOperation({ summary: 'Create a new inventory' })
  @ApiBody({
    type: CreateInventoryDto,
    description: 'Inventory to create',
  })
  create(
    @Body() createInventoryDto: CreateInventoryDto,
  ): Promise<JsonResponse<InventoryDto>> {
    return this.inventoriesService.createInventory(createInventoryDto);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiDefaultErrorResponse()
  @ApiOperation({ summary: 'Update a inventory' })
  @ApiBody({
    type: UpdateInventoryDto,
    description: 'Inventory to update',
  })
  update(
    @Body() updateInventoryDto: UpdateInventoryDto[],
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<InventoryDto>> {
    return this.inventoriesService.updateInventory(id, updateInventoryDto);
  }
}
