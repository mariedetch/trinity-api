import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Role } from '../users/enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import {
  CategoryStatsDto,
  GlobalProfitDto,
  GlobalRevenueDto,
  MonthlyRevenueDto,
  MonthlyStatsDto,
} from './dto/stats.dto';

@Controller({ path: 'stats', version: '1' })
@ApiTags('stats')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.MANAGER)
@ApiBearerAuth('access-token')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('commands/monthly')
  @ApiOperation({
    summary:
      'Récupère le nombre de commandes pour chaque mois sur les 12 derniers mois',
  })
  async getMonthlyCommandStats(): Promise<JsonResponse<MonthlyStatsDto[]>> {
    return await this.statsService.getMonthlyCommandStats();
  }

  @Get('commands/monthly-revenue')
  @ApiOperation({
    summary:
      "Récupère le chiffre d'affaire pour chaque mois sur les 12 derniers mois",
  })
  async getMonthlyRevenue(): Promise<JsonResponse<MonthlyRevenueDto[]>> {
    return await this.statsService.getMonthlyRevenue();
  }

  @Get('commands/global-revenue')
  @ApiOperation({
    summary: "Récupère le chiffre d'affaire hebdomadaire, mensuel et annuel",
  })
  async getGlobalRevenue(): Promise<JsonResponse<GlobalRevenueDto>> {
    return await this.statsService.getGlobalRevenue();
  }

  @Get('commands/global-profit')
  @ApiOperation({
    summary: 'Récupère le bénéfice hebdomadaire, mensuel et annuel',
  })
  async getGlobalProfit(): Promise<JsonResponse<GlobalProfitDto>> {
    return await this.statsService.getGlobalProfit();
  }

  @Get('customers/monthly')
  @ApiOperation({
    summary:
      'Récupère le nombre de nouveaux clients pour chaque mois sur les 12 derniers mois',
  })
  async getMonthlyNewCustomersStats(): Promise<
    JsonResponse<MonthlyStatsDto[]>
  > {
    return await this.statsService.getMonthlyNewCustomersStats();
  }

  @Get('commands/category-sales')
  @ApiOperation({
    summary: 'Récupère les 6 categories de produits les plus vendus',
  })
  async getCategoryStats(): Promise<JsonResponse<CategoryStatsDto[]>> {
    return await this.statsService.getCategoryStats();
  }
}
