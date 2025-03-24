import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Command } from '../commands/command.entity';
import { CommandProduct } from '../commands/command-product.entity';
import { JwtService } from '@nestjs/jwt';
import { Product } from '../products/product.entity';
import { CommandsModule } from '../commands/commands.module';

@Module({
  imports: [
    CommandsModule,
    TypeOrmModule.forFeature([Command, CommandProduct, Product]),
  ],
  controllers: [CartsController],
  providers: [CartsService, JwtService],
})
export class CartsModule {}
