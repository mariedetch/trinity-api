import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    return await this.authService.login(email, password);
  }

  @Post('refresh')
  async refreshToken(@Headers('authorization') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
