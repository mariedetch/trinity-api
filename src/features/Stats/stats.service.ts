import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from '../commands/command.entity';
import { ValidatedCommandStatus } from '../commands/enums';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import {
  CategoryStatsDto,
  GlobalStatsDto,
  MonthlyStatsDto,
  TopCityStatsDto,
  WeeklyStatsDto,
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

  // Fonction pour avoir le nombre de commandes pour chaque mois sur les 12 derniers mois ============================
  async getMonthlyCommandStats(): Promise<MonthlyStatsDto[]> {
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
        orders_count: count,
      });
    }

    return months;
  }

  // Fonction pour avoir le chiffre d'affaire pour chaque mois sur les 12 derniers mois ==========================
  async getMonthlyRevenue(): Promise<MonthlyStatsDto[]> {
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

    return months ;
  }

  // Route pour obtenir le total de commandes et le chiffre d'affaire pour chaque mois sur les 12 derniers mois ===========
  async getMonthlyCommandAndRevenue(): Promise<JsonResponse<MonthlyStatsDto[]>> {
    const commandResponse = await this.getMonthlyCommandStats();
    const revenueResponse = await this.getMonthlyRevenue();

    const data = commandResponse.map((commandItem, index) => ({
      month: commandItem.month,
      year: commandItem.year,
      revenue: revenueResponse[index].revenue,
      orders_count: commandItem.orders_count,
    }));
  
    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Monthly orders and revenue data retrieved successfully',
      data,
    };
  }

  // Route pour avoir le nombre de nouveaux clients pour chaque mois sur les 12 derniers mois ============================
  async getMonthlyNewCustomersStats(): Promise<JsonResponse<MonthlyStatsDto[]>> {
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

  // Route qui renvoie les 6 villes qui ont le plus de clients
  async getTopCustomerCities(): Promise<JsonResponse<TopCityStatsDto[]>> {
    const users = await this.userRepository.find({
      where: {
        role: Role.CUSTOMER,
      },
      select: ['addresses'],
    });

    // Créer un Map pour compter les occurrences de chaque ville
    const cityCount = new Map<string, number>();

    users.forEach(user => {
      if (user.addresses && Array.isArray(user.addresses)) {
        user.addresses.forEach(address => {
          if (address.city) {
            const city = address.state.trim().toLowerCase();
            cityCount.set(city, (cityCount.get(city) || 0) + 1);
          }
        });
      }
    });

    // Convertir le Map en array et trier
    const sortedCities = Array.from(cityCount.entries())
      .map(([city, count]) => ({
        city: city.charAt(0).toUpperCase() + city.slice(1), // Capitalize city name
        customer_count: count
      }))
      .sort((a, b) => b.customer_count - a.customer_count)
      .slice(0, 6);

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Top 6 cities with most customers retrieved successfully',
      data: sortedCities
    };
  }

  // Fonction pour avoir le nombre de commandes pour chaque semaine sur les 8 dernières semaines
  async getWeeklyCommandStats(): Promise<WeeklyStatsDto[]> {
    const currentDate = new Date();
    const weeks = [];

    for (let i = 0; i < 8; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7));

      // Calculer le début de la semaine (Lundi)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      // Calculer la fin de la semaine (Dimanche)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const count = await this.commandRepository
        .createQueryBuilder('command')
        .where('DATE(command.created_at) >= :startDate', {
          startDate: startOfWeek,
        })
        .andWhere('DATE(command.created_at) <= :endDate', {
          endDate: endOfWeek,
        })
        .andWhere('command.status IN (:...statuses)', {
          statuses: Object.values(ValidatedCommandStatus),
        })
        .getCount();

      // Formater la période pour l'affichage (ex: "13-19 Feb")
      const periodStart = startOfWeek.getDate();
      const periodEnd = endOfWeek.getDate();
      const startMonth = startOfWeek.toLocaleString('en-US', { month: 'short' });
      const endMonth = endOfWeek.toLocaleString('en-US', { month: 'short' });
      
      let period: string;

      if (startMonth === endMonth) {
        period = `${periodStart}-${periodEnd} ${endMonth}`;
      } else {
        period = `${periodStart} ${startMonth}-${periodEnd} ${endMonth}`;
      }

      weeks.push({
        period: period,
        startDate: startOfWeek.toISOString().split('T')[0],  // Garde uniquement la date
        endDate: endOfWeek.toISOString().split('T')[0],      // Garde uniquement la date
        year: startOfWeek.getFullYear(),
        orders_count: count,
      });
    }

    return weeks; // Pour avoir les semaines dans l'ordre chronologique
  }

  // Fonction pour avoir le chiffre d'affaire pour chaque semaine sur les 8 dernières semaines
  async getWeeklyRevenue(): Promise<WeeklyStatsDto[]> {
    const currentDate = new Date();
    const weeks = [];

    for (let i = 0; i < 8; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7));

      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const result = await this.commandRepository
        .createQueryBuilder('command')
        .select('COALESCE(SUM(command.total_price_excl), 0)', 'revenue')
        .where('DATE(command.created_at) >= :startDate', {
          startDate: startOfWeek,
        })
        .andWhere('DATE(command.created_at) <= :endDate', {
          endDate: endOfWeek,
        })
        .andWhere('command.status IN (:...statuses)', {
          statuses: Object.values(ValidatedCommandStatus),
        })
        .getRawOne();

      const periodStart = startOfWeek.getDate();
      const periodEnd = endOfWeek.getDate();
      const month = endOfWeek.toLocaleString('en-US', { month: 'short' });

      weeks.push({
        period: `${periodStart}-${periodEnd} ${month}`,
        startDate: startOfWeek.toISOString().split('T')[0],  // Garde uniquement la date
        endDate: endOfWeek.toISOString().split('T')[0],      // Garde uniquement la date
        year: startOfWeek.getFullYear(),
        revenue: Number(result.revenue),
      });
    }

    return weeks;
  }

  // Route pour obtenir le total de commandes et le chiffre d'affaire pour chaque semaine
  async getWeeklyCommandAndRevenue(): Promise<JsonResponse<WeeklyStatsDto[]>> {
    const commandResponse = await this.getWeeklyCommandStats();
    const revenueResponse = await this.getWeeklyRevenue();

    const data = commandResponse.map((commandItem, index) => ({
      period: commandItem.period,
      startDate: commandItem.startDate,
      endDate: commandItem.endDate,
      year: commandItem.year,
      revenue: revenueResponse[index].revenue,
      orders_count: commandItem.orders_count,
    }));

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Weekly orders and revenue data retrieved successfully',
      data,
    };
  }



  
  // Fonction pour avoir le chiffre d'affaire hebdomadaire, mensuel et annuel =================================================
  async getGlobalRevenue(): Promise<GlobalStatsDto> {
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

    const data: GlobalStatsDto = {
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

    return data;
  }

  // Fonction qui renvoie le benéfice hebdomadaire, mensuel et annuel ===========================================================
  async getGlobalProfit(): Promise<GlobalStatsDto> {
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

    const data: GlobalStatsDto = {
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

    return data;
  }

  // Fonction pour obtenir le total de commandes hebdomadaire, mensuel et annuel ==============================
  async getGlobalOrderCount(): Promise<GlobalStatsDto> {
    const currentDate = new Date();

    // Calculer les dates pour la semaine
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(
      currentDate.getDate() - ((currentDate.getDay() + 6) % 7)
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

    // Récupérer le nombre de commandes hebdomadaire
    const weeklyCount = await this.commandRepository
      .createQueryBuilder('command')
      .where('DATE(command.created_at) >= :startDate', {
        startDate: startOfWeek,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfWeek })
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .getCount();

    // Récupérer le nombre de commandes mensuel
    const monthlyCount = await this.commandRepository
      .createQueryBuilder('command')
      .where('DATE(command.created_at) >= :startDate', {
        startDate: startOfMonth,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfMonth })
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .getCount();

    // Récupérer le nombre de commandes annuel
    const yearlyCount = await this.commandRepository
      .createQueryBuilder('command')
      .where('DATE(command.created_at) >= :startDate', {
        startDate: startOfYear,
      })
      .andWhere('DATE(command.created_at) <= :endDate', { endDate: endOfYear })
      .andWhere('command.status IN (:...statuses)', {
        statuses: Object.values(ValidatedCommandStatus),
      })
      .getCount();

    const data: GlobalStatsDto = {
      weekly: {
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0],
        orders_count: weeklyCount,
      },
      monthly: {
        month: startOfMonth.toLocaleString('en-US', { month: 'long' }),
        year: startOfMonth.getFullYear(),
        orders_count: monthlyCount,
      },
      yearly: {
        year: startOfYear.getFullYear(),
        orders_count: yearlyCount,
      },
    };

    return data;
  }

  // Route pour retourner le chiffre d'affaire, le bénéfice et le nombre de commandes ====================================================
  async getGlobalStats(): Promise<JsonResponse<GlobalStatsDto>> {
    const revenueResponse = await this.getGlobalRevenue();
    const profitResponse = await this.getGlobalProfit();
    const ordersResponse = await this.getGlobalOrderCount();
        
    const data: GlobalStatsDto = {
      weekly: {
        start_date: revenueResponse.weekly.start_date,
        end_date: revenueResponse.weekly.end_date,
        revenue: revenueResponse.weekly.revenue,
        profit: profitResponse.weekly.profit,
        orders_count: ordersResponse.weekly.orders_count,
      },
      monthly: {
        month: revenueResponse.monthly.month,
        year: revenueResponse.monthly.year,
        revenue: revenueResponse.monthly.revenue,
        profit: profitResponse.monthly.profit,
        orders_count: ordersResponse.monthly.orders_count,
      },
      yearly: {
        year: revenueResponse.yearly.year,
        revenue: revenueResponse.yearly.revenue,
        profit: profitResponse.yearly.profit,
        orders_count: ordersResponse.yearly.orders_count,
      },
    };

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      message: 'Global statistics retrieved successfully',
      data,
    };
  }

  // Route qui renvoie les 6 categories de produits les plus vendus ===================================================
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
