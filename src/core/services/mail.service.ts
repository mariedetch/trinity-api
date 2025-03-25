import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { logger } from '../logger/winston.logger';
import { ConfigService } from '@nestjs/config';

export interface MailData {
  from?: string,
  to: string,
  subject: string,
  body: string,
  attachements?: []
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configurer nodemailer
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendMail(data: MailData): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: data.from ?? 'T-Shop',
        to: data.to,
        subject: data.subject,
        html: data.body
      });
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }
}