import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from '../commands/command.entity';
import { ValidatedCommandStatus } from '../commands/enums';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import {
  CategoryStatsDto,
  GlobalProfitDto,
  GlobalRevenueDto,
  MonthlyRevenueDto,
  MonthlyStatsDto,
} from './dto/stats.dto';
import { User } from '../users/user.entity';
import { Role } from '../users/enum';
import { CommandProduct } from '../commands/command-product.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CommandProduct)
    private readonly commandProductRepository: Repository<CommandProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Route pour avoir le nombre de commandes pour chaque mois sur les 12 derniers mois
  async getMonthlyCommandStats(): Promise<JsonResponse<MonthlyStatsDto[]>> {
    const currentDate = new Date();
    const months = [];

    // Une bloucle qui va s'étendre sur les 12 derniers mois
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);

      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); // pour chaque mois, on récupère le premier jour du mois
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // pour chaque mois, on récupère le dernier jour du mois

      const count = await this.commandRepository
        .createQueryBuilder('command')
        .where('DATE(command.created_at) >= :startDate', {
          startDate: startOfMonth,
        })
        .andWhere('DATE(command.created_at) <= :endDate', {
          endDate: endOfMonth,
        })
        .andWhere('command.status IN (:...statuses)', {
          statuses: Object.values(ValidatedCommandStatus),
        })
        .getCount();

      months.push({
        month: startOfMonth.toLocaleString('en-US', { month: 'short' }),
        year: startOfMonth.getFullYear(),
        count,
      });
    }

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Monthly command statistics retrieved successfully',
      data: months,
    };
  }

  // Route pour avoir le chiffre d'affaire pour chaque mois sur les 12 derniers mois
  async getMonthlyRevenue(): Promise<JsonResponse<MonthlyRevenueDto[]>> {
    const currentDate = new Date();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const result = await this.commandRepository
        .createQueryBuilder('command')
        .select('COALESCE(SUM(command.total_price_excl), 0)', 'revenue')
        .where('DATE(command.created_at) >= :startDate', {
          startDate: startOfMonth,
        })
        .andWhere('DATE(command.created_at) <= :endDate', {
          endDate: endOfMonth,
        })
        .andWhere('command.status IN (:...statuses)', {
          statuses: Object.values(ValidatedCommandStatus),
        })
        .getRawOne();

      months.push({
        month: startOfMonth.toLocaleString('en-US', { month: 'short' }),
        year: startOfMonth.getFullYear(),
        revenue: Number(result.revenue),
      });
    }

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Monthly revenue statistics retrieved successfully',
      data: months,
    };
  }

  // Route pour avoir le nombre de nouveaux clients pour chaque mois sur les 12 derniers mois
  async getMonthlyNewCustomersStats(): Promise<
    JsonResponse<MonthlyStatsDto[]>
  > {
    const currentDate = new Date();
    const months = [];

    // Générer les 12 derniers mois
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await this.userRepository
        .createQueryBuilder('user')
        .where('DATE(user.created_at) >= :startDate', {
          startDate: startOfMonth,
        })
        .andWhere('DATE(user.created_at) <= :endDate', { endDate: endOfMonth })
        .andWhere('user.role = :role', { role: Role.CUSTOMER })
        .getCount();

      months.push({
        month: startOfMonth.toLocaleString('en-US', { month: 'short' }),
        year: startOfMonth.getFullYear(),
        count,
      });
    }

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Monthly new customers statistics retrieved successfully',
      data: months,
    };
  }

  // Route pour avoir le chiffre d'affaire hebdomadaire, mensuel et annuel
  async getGlobalRevenue(): Promise<JsonResponse<GlobalRevenueDto>> {
    const currentDate = new Date();

    // Calculer les dates pour la semaine
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(
      currentDate.getDate() - ((currentDate.getDay() + 6) % 7),
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Calculer les dates pour le mois
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    // Calculer les dates pour l'année
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);

    // Récupérer le chiffre d'affaires hebdomadaire
    const weeklyRevenue = await this.commandRepository
      .createQueryBuilder('command')
      .select('COALESCE(SUM(command.total_price_excl), 0)', 'revenue')
      .where('DATE(command.created_at) >= :startDate', {
        startDate: startOfWeek,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfWeek })
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .getRawOne();

    // Récupérer le chiffre d'affaires mensuel
    const monthlyRevenue = await this.commandRepository
      .createQueryBuilder('command')
      .select('COALESCE(SUM(command.total_price_excl), 0)', 'revenue')
      .where('DATE(command.created_at) >= :startDate', {
        startDate: startOfMonth,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfMonth })
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .getRawOne();

    // Récupérer le chiffre d'affaires annuel
    const yearlyRevenue = await this.commandRepository
      .createQueryBuilder('command')
      .select('COALESCE(SUM(command.total_price_excl), 0)', 'revenue')
      .where('DATE(command.created_at) >= :startDate', {
        startDate: startOfYear,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfYear })
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .getRawOne();

    const data: GlobalRevenueDto = {
      weekly: {
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0],
        revenue: Number(weeklyRevenue.revenue.toFixed(3)),
      },
      monthly: {
        month: startOfMonth.toLocaleString('en-US', { month: 'long' }),
        year: startOfMonth.getFullYear(),
        revenue: Number(monthlyRevenue.revenue.toFixed(3)),
      },
      yearly: {
        year: startOfYear.getFullYear(),
        revenue: Number(yearlyRevenue.revenue.toFixed(3)),
      },
    };

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Global revenue statistics retrieved successfully',
      data,
    };
  }

  // Route qui renvoie le chiffre d'affaire hebdomadaire, mensuel et annuel
  async getGlobalProfit(): Promise<JsonResponse<GlobalProfitDto>> {
    const currentDate = new Date();

    // Calculer les dates pour la semaine
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(
      currentDate.getDate() - ((currentDate.getDay() + 6) % 7),
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Calculer les dates pour le mois
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    // Calculer les dates pour l'année
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);

    // Base query for calculating profit
    const baseQuery = this.commandRepository
      .createQueryBuilder('command')
      .leftJoinAndSelect('command.command_products', 'command_products')
      .leftJoinAndSelect('command_products.product', 'product')
      .select(
        'COALESCE(SUM((product.selling_price - product.initial_cost) * command_products.quantity), 0)',
        'profit',
      )
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      });

    // Récupérer le profit hebdomadaire
    const weeklyProfit = await baseQuery
      .clone()
      .andWhere('DATE(command.created_at) >= :startDate', {
        startDate: startOfWeek,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfWeek })
      .getRawOne();

    // Récupérer le profit mensuel
    const monthlyProfit = await baseQuery
      .clone()
      .andWhere('DATE(command.created_at) >= :startDate', {
        startDate: startOfMonth,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfMonth })
      .getRawOne();

    // Récupérer le profit annuel
    const yearlyProfit = await baseQuery
      .clone()
      .andWhere('DATE(command.created_at) >= :startDate', {
        startDate: startOfYear,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfYear })
      .getRawOne();

    const data: GlobalProfitDto = {
      weekly: {
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0],
        profit: Number(weeklyProfit.profit.toFixed(3)),
      },
      monthly: {
        month: startOfMonth.toLocaleString('en-US', { month: 'long' }),
        year: startOfMonth.getFullYear(),
        profit: Number(monthlyProfit.profit.toFixed(3)),
      },
      yearly: {
        year: startOfYear.getFullYear(),
        profit: Number(yearlyProfit.profit.toFixed(3)),
      },
    };

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Global profit statistics retrieved successfully',
      data,
    };
  }

  // Route qui renvoie les 6 categories de produits les plus vendus
  async getCategoryStats(): Promise<JsonResponse<CategoryStatsDto[]>> {
    const rawResult = await this.commandRepository
      .createQueryBuilder('command')
      .innerJoin('command.command_products', 'command_product')
      .innerJoin('command_product.product', 'product')
      .where('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .groupBy('product.category')
      .select('product.category', 'category')
      .addSelect('SUM(command_product.quantity)', 'total_quantity')
      .orderBy('total_quantity', 'DESC')
      .limit(6)
      .getRawMany();

    const categoryStats = rawResult.map((item) => ({
      category: item.category,
      total_quantity: parseInt(item.total_quantity, 10),
    }));

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Top 6 categories by sales volume retrieved successfully',
      data: categoryStats,
    };
  }
}
