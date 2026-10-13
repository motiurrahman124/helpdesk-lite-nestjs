import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(
    destination: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const host = this.config.get<string>('smtp.host');
    if (!host) {
      if (this.config.get<string>('nodeEnv') === 'production') {
        throw new Error('SMTP is not configured');
      }
      this.logger.log(`Email to ${destination}\n${subject}\n${body}`);
      return;
    }

    const user = this.config.get<string>('smtp.user');
    const port = this.config.get<number>('smtp.port') ?? 587;
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user
        ? {
            user,
            pass: this.config.get<string>('smtp.pass'),
          }
        : undefined,
    });

    await transport.sendMail({
      from: this.config.get<string>('smtp.from'),
      to: destination,
      subject,
      text: body,
    });
  }
}
