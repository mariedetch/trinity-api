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
  GlobalStatsDto,
  MonthlyStatsDto,
  TopCityStatsDto,
  WeeklyStatsDto,
} from './dto/stats.dto';

@Controller({ path: 'stats', version: '1' })
@ApiTags('stats')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.MANAGER)
@ApiBearerAuth('access-token')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('commands/monthly-stats')
  @ApiOperation({
    summary:
      "Récupère le nombre de commandes et le chiffre d'affaire pour chaque mois sur les 12 derniers mois",
  })
  async getMonthlyStats(): Promise<JsonResponse<MonthlyStatsDto[]>> {
    return await this.statsService.getMonthlyCommandAndRevenue();
  }
  
  @Get('commands/weekly-stats')
  @ApiOperation({
    summary:
      "Récupère le nombre de commandes et le chiffre d'affaire pour chaque semaine sur les 8 dernières semaines",
  })
  async getWeeklyStats(): Promise<JsonResponse<WeeklyStatsDto[]>> {
    return await this.statsService.getWeeklyCommandAndRevenue();
  }

  @Get('commands/global-stats')
  @ApiOperation({
    summary: "Récupère le chiffre d'affaire, le bénéfice et le total de commandes : hebdomadaire, mensuel et annuel",
  })
  async getGlobalRevenue(): Promise<JsonResponse<GlobalStatsDto>> {
    return await this.statsService.getGlobalStats();
  }

  @Get('customers/monthly')
  @ApiOperation({
    summary:
      'Récupère le nombre de nouveaux clients pour chaque mois sur les 12 derniers mois',
  })
  async getMonthlyNewCustomersStats(): Promise<JsonResponse<MonthlyStatsDto[]>> {
    return await this.statsService.getMonthlyNewCustomersStats();
  }

  @Get('customers/top-cities')
  @ApiOperation({
    summary:
      'Récupère les 6 villes qui ont le plus de clients',
  })
  async getTopCustomerCities(): Promise<JsonResponse<TopCityStatsDto[]>> {
    return await this.statsService.getTopCustomerCities();
  }

  @Get('commands/category-sales')
  @ApiOperation({
    summary: 'Récupère les 6 categories de produits les plus vendus',
  })
  async getCategoryStats(): Promise<JsonResponse<CategoryStatsDto[]>> {
    return await this.statsService.getCategoryStats();
  }
}
