import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CommandsModule } from './commands/commands.module';

@Module({
  imports: [ProductsModule, CommandsModule],
  providers: [],
})
export class FeaturesModule {}
