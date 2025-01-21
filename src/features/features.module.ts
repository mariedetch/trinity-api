import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CommandsModule } from './commands/commands.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    ProductsModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    CustomersModule,
    CommandsModule,
  ],
  providers: [],
})
export class FeaturesModule {}
