import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Req,
  Query,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/responses/api-success-response.decorator';
import { NotificationDto } from './dto/notification.dto';
import { Request as ExpressRequest } from 'express';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';

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
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'isRead', required: false })
  async findAllByUser(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('isRead') isRead: boolean,
    @Req() req: ExpressRequest,
  ): Promise<JsonResponse<PaginationResource<NotificationDto>>> {
    const currentPage = page && page > 0 ? page : 1;
    const itemsPerPage = perPage && perPage > 0 ? perPage : 20;

    const payload = req['user'];
    const id = payload.sub;

    return this.notificationsService.findAllByUser(
      currentPage,
      itemsPerPage,
      isRead,
      id,
    );
  }

  @Get(':id')
  @ApiDefaultErrorResponse()
  @ApiSuccessResponse({
    model: NotificationDto,
    description: 'The notification has been successfully retieved.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(id);
  }

  @Put(':id')
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JsonResponse<NotificationDto>> {
    return this.notificationsService.markAsRead(id);
  }
}
