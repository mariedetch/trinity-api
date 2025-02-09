import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}
