import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CommandsModule } from './commands/commands.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CustomersModule } from './customers/customers.module';
import { CartsModule } from './carts/cart.module';
import { InventoriesModule } from './inventories/inventories.module';
import { StatsModule } from './stats/stats.module';
import { SuppliesModule } from './supplies/supplies.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payment.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ProductsModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    CustomersModule,
    CommandsModule,
    CartsModule,
    InventoriesModule,
    StatsModule,
    SuppliesModule,
    NotificationsModule,
    PaymentsModule,
    FavoritesModule
  ],
  providers: [],
})
export class FeaturesModule {}
