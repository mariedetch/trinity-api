import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { UsersModule } from '../users/users.module';
import { User } from 'src/features/users/user.entity';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User])],
  providers: [ProfilesService, UsersService, JwtService],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
