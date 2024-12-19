import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { ProductDto } from './dto/product.dto';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller({ path: 'products', version: '1' })
@ApiTags('products')
@ApiBearerAuth('access-token')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    responseType: ApiCreatedResponse,
    description: 'The product has been successfully created.',
  })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<JsonResponse<ProductDto>> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The products has been successfully retieved.',
  })
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<JsonResponse<PaginationResource<ProductDto>>> {
    return this.productsService.findAll(page, perPage);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The product has been successfully retieved.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<ProductDto>> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The product has been successfully updated.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<JsonResponse<ProductDto>> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The product has been successfully deleted.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<JsonResponse<void>> {
    return this.productsService.softRemove(id);
  }
}
