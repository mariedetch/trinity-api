import { Body, Controller,Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommandsService } from './commands.service';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { request } from 'http';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CommandStatsDto } from './dto/command-stats.dto';
import { CommandDetailsDto } from './dto/command-detail.dto';
import { CommandProductsDto } from './dto/command-products.dto';
import { CommandStatus } from './enums';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { UpdateCommandStatusDto } from './dto/update-command-status.dto';
import { CartItem } from '../carts/dto/cart-response.dto';

@Controller({ path: 'commands', version: '1' })
@ApiTags('commands')
@UseGuards(AuthGuard) // Il s'applique à toutes les routes
@ApiBearerAuth('access-token')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Get()
  @ApiDefaultErrorResponse()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customer', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  async getCommandList(
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('status') status?: CommandStatus,
    @Query('customer') customer?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<JsonResponse<PaginationResource<CommandDetailsDto>>> {
    const userId = request['user'].sub;
    const userRole = request['user'].role;

    const query = {
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : 10, 
      status,
      customer,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      user_id: userRole === 'CUSTOMER' ? userId : undefined,
    };

    return await this.commandsService.getCommandList(query);
  }

  @Get('g/stats')
  @ApiDefaultErrorResponse()
  async getCommandStats(): Promise<JsonResponse<CommandStatsDto>> {
    return await this.commandsService.getCommandStats();
  }

  @Get(':id')
  @ApiDefaultErrorResponse()
  async getCommandDetails(@Param('id') commandId: string): Promise<JsonResponse<CommandDetailsDto>> {
    return await this.commandsService.getCommandDetails(commandId);
  }
 
  @Get(':id/products')
  async getCommandProducts(@Param('id') commandId: string): Promise<JsonResponse<CartItem[]>> {
    return await this.commandsService.getCommandProducts(commandId);
  }

  @Put(':id')
  async updateCommandStatus(
    @Param('id') commandId: string,
    @Body() updateDto: UpdateCommandStatusDto,
  ): Promise<JsonResponse<CommandDetailsDto>> {
    updateDto.command_id = commandId
    return await this.commandsService.updateCommandStatus(updateDto);
  }

}
