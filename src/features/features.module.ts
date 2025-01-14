import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CommandsModule } from './commands/commands.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, ProductsModule, CommandsModule],
  providers: [],
})
export class FeaturesModule {}
