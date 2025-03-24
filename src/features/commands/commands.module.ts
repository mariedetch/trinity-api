import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from './command.entity';
import { CommandProduct } from './command-product.entity';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { ProductsModule } from '../products/products.module';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { CommandPaidListener } from './listeners/command-paid.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Command, CommandProduct, User]),
    ProductsModule, // On importe ce module car nous aurons besoin d'accéder aux produits
  ],
  exports: [CommandsService],
  controllers: [CommandsController],
  providers: [CommandsService, CommandPaidListener, JwtService],
})
export class CommandsModule {}
