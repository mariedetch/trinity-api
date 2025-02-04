import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { plainToClass } from 'class-transformer';
import { NotificationDto } from './dto/notification.dto';
import { NotFoundException } from '@nestjs/common';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  convertToDto(notification: Notification | Notification[]): any {
    return plainToClass(NotificationDto, notification);
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<JsonResponse<NotificationDto>> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return successResponse(
      this.convertToDto(notification),
      `Notification created successfully`,
      201,
    );
  }

  async findAllByUser(
    user_id: string,
  ): Promise<JsonResponse<NotificationDto[]>> {
    const [notifications] = await this.notificationsRepository.find({
      where: { user_id: user_id },
    });
    return successResponse(
      this.convertToDto(notifications),
      `Notification created successfully`,
      201,
    );
  }

  async findOne(id: string): Promise<JsonResponse<NotificationDto[]>> {
    const notification = await this.notificationsRepository.findOneOrFail({
      where: { id: id },
    });
    return successResponse(
      this.convertToDto(notification),
      `Notification created successfully`,
      201,
    );
  }

  async markAsRead(
    notification_id: string,
  ): Promise<JsonResponse<NotificationDto>> {
    const notification = await this.notificationsRepository.findOneOrFail({
      where: { id: notification_id },
    });

    notification.isRead = true;
    await this.notificationsRepository.save(notification);

    return successResponse(
      await this.convertToDto(notification),
      `Notification created successfully`,
      201,
    );
  }
}
