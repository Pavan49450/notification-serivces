import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter = nodemailer.createTransport({
    // service: "gmail",
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendEmail(to: string, subject: string, text: string, retries = 3) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      if (retries > 0) {
        this.logger.log(
          `Retrying to send email to ${to} (${retries} retries left)`,
        );
        setTimeout(
          () => this.sendEmail(to, subject, text, retries - 1),
          this.getRetryDelay(retries),
        );
      }
    }
  }

  private getRetryDelay(retries: number): number {
    return Math.pow(2, 3 - retries) * 1000; // exponential backoff
  }
}
