import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from '../commands/command.entity';
import { CommandProduct } from '../commands/command-product.entity';
import { JwtService } from '@nestjs/jwt';
import { Product } from '../products/product.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Command, CommandProduct, Product, User])],
  controllers: [StatsController],
  providers: [StatsService, JwtService],
})
export class StatsModule {}
