import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CommandsModule } from './commands/commands.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CustomersModule } from './customers/customers.module';
import { CartsModule } from './carts/cart.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ProductsModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    CustomersModule,
    CommandsModule,
    CartsModule,
    NotificationsModule,
  ],
  providers: [],
})
export class FeaturesModule {}
