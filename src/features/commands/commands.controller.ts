import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommandsService } from './commands.service';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CommandStatsDto } from './dto/command-stats.dto';
import { CommandDto } from './dto/command-detail.dto';
import { CommandStatus } from './enums';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';
import { UpdateCommandStatusDto } from './dto/update-command-status.dto';
import { CommandProductDto } from './dto/command-products.dto';
import { SortDirection } from 'src/common/utils/constants';

@Controller({ path: 'commands', version: '1' })
@ApiTags('Commands')
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
  @ApiQuery({ name: 'sortDir', required: false })
  async getCommandList(
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('status') status?: CommandStatus,
    @Query('customer') customer?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('sortDir') sortDir?: SortDirection,
  ): Promise<JsonResponse<PaginationResource<CommandDto>>> {
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
      sortDir: sortDir ?? 'DESC',
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
  async getCommandDetails(
    @Param('id') commandId: string,
  ): Promise<JsonResponse<CommandDto>> {
    return await this.commandsService.getCommandById(commandId);
  }

  @Get(':id/products')
  async getCommandProducts(
    @Param('id') commandId: string,
  ): Promise<JsonResponse<CommandProductDto[]>> {
    return await this.commandsService.getCommandProducts(commandId);
  }

  @Put(':id')
  async updateCommandStatus(
    @Param('id') commandId: string,
    @Body() updateDto: UpdateCommandStatusDto,
  ): Promise<JsonResponse<CommandDto>> {
    return await this.commandsService.updateCommandStatus(commandId, updateDto);
  }
}
