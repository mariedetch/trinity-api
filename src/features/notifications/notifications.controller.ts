import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { NotificationDto } from './dto/notification.dto';
import { Request as ExpressRequest } from 'express';
import { JsonResponse } from 'src/common/helpers/json-response.helper';

@Controller({ path: 'notifications', version: '1' })
@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: NotificationDto,
    description: 'The notification has been successfully retieved.',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<JsonResponse<NotificationDto>> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: NotificationDto,
    description:
      'The notifications of the auth user has been successfully retieved.',
  })
  async findAllByUser(@Req() req: ExpressRequest) {
    const payload = req['user'];
    const id = payload.sub;
    return this.notificationsService.findAllByUser(id);
  }

  @Get(':id')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: NotificationDto,
    description: 'The notification has been successfully retieved.',
  })
  async findOne(@Param() id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  async markAsRead(
    @Param() id: string,
  ): Promise<JsonResponse<NotificationDto>> {
    return this.notificationsService.markAsRead(id);
  }
}
