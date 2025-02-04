import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  async sendNotification(createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(
      createNotificationDto,
    );
    this.server.emit(
      `notification-${createNotificationDto.user_id}`,
      notification,
    );
  }

  @SubscribeMessage('markAsRead')
  async markAsRead(client: Socket, id: string) {
    const notification = await this.notificationsService.markAsRead(id);
    if (notification) {
      client.emit('notificationUpdated', notification);
    }
  }
}
