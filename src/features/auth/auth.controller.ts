import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { LoginResponseDto } from './dto/login-response.dto';
import { Request as ExpressRequest, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginThrottlerGuard } from 'src/core/guards/throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from '../verification-code/dto/verify-code.dto';
import { CompleteRegistrationDto, RegisterEmailDto, VerifyRegistrationCodeDto } from './dto/register-user.dto';

@Controller({ path: 'auth', version: '1' })
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(LoginThrottlerGuard)
  async login(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<JsonResponse<LoginResponseDto>> {
    const { email, password } = loginUserDto;
    return this.authService.login(req, res, { email, password });
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshToken: RefreshTokenDto,
  ): Promise<JsonResponse<LoginResponseDto>> {
    const token = this.authService.getTokenFromHeader(
      refreshToken.refreshToken,
    );
    return this.authService.refreshToken(req, res, token);
  }

  @Post('user')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async getAuthUser(@Req() req: ExpressRequest) {
    const payload = req['user'];
    return await this.authService.getAuthUser(payload);
  }

  @Post('change-password')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async changePassword(
    @Req() req: ExpressRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<JsonResponse<null>> {
    const user_id = req['user'].sub;
    const user_email = req['user'].email;
    return await this.authService.changePassword(user_id, user_email, changePasswordDto);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<JsonResponse<null>> {
    return await this.authService.sendResetPasswordEmail(forgotPasswordDto);
  }
  
  @Post('verify-reset-code')
  async verifyResetCode(
    @Body() verifyCodeDto: VerifyCodeDto,
  ): Promise<JsonResponse<null>> {
    return await this.authService.verifyResetCode(verifyCodeDto);
  }
  
  @Post('reset-password')
  async setNewPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<JsonResponse<null>> {
    return await this.authService.setNewPassword(resetPasswordDto);
  }

  @Post('register/request-code')
  async registerEmail(
    @Body() registerEmailDto: RegisterEmailDto,
  ): Promise<JsonResponse<null>> {
    return await this.authService.registerEmail(registerEmailDto);
  }

  @Post('register/verify-code')
  async verifyRegistrationCode(
    @Body() verifyRegistrationCodeDto: VerifyRegistrationCodeDto,
  ): Promise<JsonResponse<null>> {
    return await this.authService.verifyRegistrationCode(verifyRegistrationCodeDto);
  }

  @Post('register/complete')
  async completeRegistration(
    @Body() completeRegistrationDto: CompleteRegistrationDto,
  ): Promise<JsonResponse<null>> {
    return await this.authService.completeRegistration(completeRegistrationDto);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async logout(@Req() req: ExpressRequest) {
    const payload = req['user'];
    return this.authService.logout(payload);
  }
}
