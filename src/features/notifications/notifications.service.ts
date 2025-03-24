import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { plainToClass } from 'class-transformer';
import { NotificationDto } from './dto/notification.dto';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { PaginationResource } from 'src/core/interfaces/pagination-resource.interface';

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
    page: number,
    perPage: number,
    isRead: boolean,
    user_id: string,
  ): Promise<JsonResponse<PaginationResource<NotificationDto>>> {
    const conditions = { user_id: user_id };

    if (isRead) {
      conditions['isRead'] = false;
    }

    const [notifications, total] =
      await this.notificationsRepository.findAndCount({
        where: conditions,
        skip: ((page <= 0 ? 1 : page) - 1) * perPage,
        take: perPage,
        order: { createdAt: 'DESC' },
      });

    const result: PaginationResource<NotificationDto> = {
      items: this.convertToDto(notifications),
      currentPage: page,
      perPage,
      total,
    };

    return successResponse(result, `Notification retrived successfully`);
  }

  async findOne(id: string): Promise<JsonResponse<NotificationDto[]>> {
    const notification = await this.notificationsRepository.findOneOrFail({
      where: { id: id },
    });
    return successResponse(
      this.convertToDto(notification),
      `Notification created successfully`,
      200,
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
      200,
    );
  }
}
