import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    const { email, password } = loginUserDto;
    return await this.authService.login(email, password, req);
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  async refreshToken(@Headers('authorization') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('me')
  @UseGuards(AuthGuard)
  async getAuthUser(@Req() req: Request) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.authService.getAuthUser(token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.logout(token, req);
  }
}
