import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from 'src/features/users/user.entity';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { JwtConfigModule } from 'src/config/jwt/config.module';
import { CsrfConfigModule } from 'src/config/csrf/config.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    JwtConfigModule,
    CsrfConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, CsrfConfigService, JwtConfigService],
})
export class AuthModule {}
