import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { ProductDto } from './dto/product.dto';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { ProductStatsDto } from './dto/product-stats.dto';
import { PriceJsonItem } from 'src/core/interfaces/price-json.interface';
import { ProductOrderHistoryDto } from './dto/product-orders.dto';

@Controller({ path: 'products', version: '1' })
@ApiTags('products')
@ApiBearerAuth('access-token')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()    // Route pour créer un produit
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
    description: 'The products has been successfully retrieved.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'name', required: false})
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minQuantity', required: false })
  @ApiQuery({ name: 'maxQuantity', required: false })
  getAllProducts(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minQuantity') minQuantity?: number,
    @Query('maxQuantity') maxQuantity?: number,
  ): Promise<JsonResponse<PaginationResource<ProductDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;
  
    const searchOptions = {
      name,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      quantity_in_stock: minQuantity ? Number(minQuantity) : undefined,
      alert_threshold: maxQuantity ? Number(maxQuantity) : undefined,
    };
  
    return this.productsService.findAllProducts(currentPage, itemsPerPage, searchOptions);
  }
  
  @Get(':id')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: ProductDto,
    description: 'The product has been successfully retrieved.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<ProductDto>> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
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

  @Get('g/stats')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: Object,
    description: 'Products statistics have been successfully retrieved.',
  })
  async getProductStats(): Promise<JsonResponse<ProductStatsDto>> {
    return await this.productsService.getProductStats();
  }

  @Get(':id/prices')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: Object,
    description: 'Product price history has been successfully retrieved.',
  })
  getPriceHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<Array<PriceJsonItem>>> {
    return this.productsService.getPriceHistory(id);
  }

  @Get(':id/orders')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: Object,
    description: 'Product order history has been successfully retrieved.',
  })
  getOrderHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<Array<ProductOrderHistoryDto>>> {
    return this.productsService.getOrderHistory(id);
  }

}

