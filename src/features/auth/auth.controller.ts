import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { LoginResponseDto } from './dto/login-response.dto';
import { Request as ExpressRequest, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<JsonResponse<LoginResponseDto>> {
    const { email, password } = loginUserDto;
    return this.authService.login(req, res, { email, password });
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  async refreshToken(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Headers('token') refreshToken: string,
  ): Promise<JsonResponse<LoginResponseDto>> {
    const token = this.authService.getTokenFromHeader(refreshToken);
    return this.authService.refreshToken(req, res, token);
  }

  @Post('user')
  @UseGuards(AuthGuard)
  async getAuthUser(@Headers('token') authHeader: string) {
    const token = this.authService.getTokenFromHeader(authHeader);
    return await this.authService.getAuthUser(token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Headers('token') authHeader: string) {
    const token = this.authService.getTokenFromHeader(authHeader);
    return this.authService.logout(token);
  }
}
