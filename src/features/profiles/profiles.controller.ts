import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { Request as ExpressRequest } from 'express';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { PasswordDto } from './dto/password.dto';
import { Addresses } from '../users/dto/addresses.dto';

@Controller({ path: 'users/profile', version: '1' })
@ApiTags('user profile')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: ExpressRequest) {
    const payload = req['user'];
    return await this.profilesService.getProfile(payload.sub);
  }

  @Put()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: ExpressRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const payload = req['user'];
    return await this.usersService.update(payload.sub, updateUserDto);
  }

  @Put('update-password')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async updateProfilePassword(
    @Req() req: ExpressRequest,
    @Body() passwordDto: PasswordDto,
  ) {
    const payload = req['user'];
    return await this.usersService.update(payload.sub, passwordDto);
  }

  @Get('addresses')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async getProfileAddresses(@Req() req: ExpressRequest) {
    const payload = req['user'];
    return await this.profilesService.getProfileAddresses(payload.sub);
  }

  @Post('addresses')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async createProfileAddresses(
    @Req() req: ExpressRequest,
    @Body() addresses: Addresses,
  ) {
    const payload = req['user'];
    return await this.profilesService.createProfileAddresses(
      payload.sub,
      addresses,
    );
  }

  @Put('addresses/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async updateProfileAddresses(
    @Req() req: ExpressRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addresses: Addresses,
  ) {
    const payload = req['user'];
    return await this.profilesService.updateProfileAddresses(
      payload.sub,
      addresses,
      id,
    );
  }

  @Delete('addresses/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async deleteProfileAddresses(
    @Req() req: ExpressRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addresses: Addresses,
  ) {
    const payload = req['user'];
    return await this.profilesService.deleteProfileAddresses(payload.sub, id);
  }
}
