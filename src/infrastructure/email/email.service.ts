import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('MAIL_USERNAME'),
        pass: this.config.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendHtmlMessage(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.get<string>('MAIL_USERNAME'),
      to,
      subject,
      html,
    });
  }
}
