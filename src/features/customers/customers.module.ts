import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/features/users/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Command } from '../commands/command.entity';
import { CommandsModule } from '../commands/commands.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Command]),
    CommandsModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService, UsersService, JwtService],
})
export class CustomersModule {}
