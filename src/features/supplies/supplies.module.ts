import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliesService } from './supplies.service';
import { SuppliesController } from './supplies.controller';
import { Supply } from './supply.entity';
import { SupplyProduct } from './supply-product.entity';
import { ProductsModule } from 'src/features/products/products.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Supply, SupplyProduct]), ProductsModule],
  providers: [SuppliesService, JwtService],
  controllers: [SuppliesController],
})
export class SuppliesModule {}
