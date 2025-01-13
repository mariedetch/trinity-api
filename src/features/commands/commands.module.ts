import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from './command.entity';
import { CommandProduct } from './command-product.entity';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Command, CommandProduct]),
    ProductsModule // On importe ce module car nous aurons besoin d'accéder aux produits
  ],
  controllers: [CommandsController],
  providers: [CommandsService],
})
export class CommandsModule {}