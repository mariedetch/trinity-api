import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ApiConfigService } from 'src/config/api/config.service';
import { resetPasswordTemplate } from 'src/features/auth/templates/reset-password.template';
import { logger } from '../logger/winston.logger';

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

  constructor(private configService: ApiConfigService) {
    // Configurer nodemailer
    this.transporter = nodemailer.createTransport({
      host: this.configService.mailHost,
      port: this.configService.mailHost,
      secure: this.configService.mailSecure,
      auth: {
        user: this.configService.mailUser,
        pass: this.configService.mailPassword,
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