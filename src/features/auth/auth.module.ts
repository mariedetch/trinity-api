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
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoginThrottlerGuard } from 'src/core/guards/throttler.guard';
import { ConfigModule } from '@nestjs/config';
import { VerificationCodeModule } from '../verification-code/verification-code.module';
import { MailService } from 'src/core/services/mail.service';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    JwtConfigModule,
    CsrfConfigModule,
    VerificationCodeModule,
    ConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 15,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    CsrfConfigService,
    JwtConfigService,
    MailService,
    {
      provide: APP_GUARD,
      useClass: LoginThrottlerGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
