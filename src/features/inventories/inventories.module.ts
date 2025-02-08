import { Module } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';
import { ProductsModule } from 'src/features/products/products.module';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './inventory.entity';
import { InventoryProduct } from './inventory-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryProduct]),
    ProductsModule,
  ],
  providers: [InventoriesService, JwtService],
  controllers: [InventoriesController],
})
export class InventoriesModule {}
