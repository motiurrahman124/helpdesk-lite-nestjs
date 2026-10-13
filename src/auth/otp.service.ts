import crypto from 'node:crypto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpType } from '../generated/prisma/client.js';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const RESEND_COOLDOWN_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async send(destination: string, otpType: OtpType, subject: string) {
    const existing = await this.prisma.otp.findUnique({
      where: { destination_otpType: { destination, otpType } },
      select: { updatedAt: true },
    });
    const resendAt = existing
      ? existing.updatedAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000
      : 0;
    if (resendAt > Date.now()) {
      const retryAfterSeconds = Math.ceil((resendAt - Date.now()) / 1000);
      throw new HttpException(
        `Please wait ${retryAfterSeconds}s before requesting a new code.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpLength = this.config.get<number>('otp.length') ?? 6;
    const code = crypto
      .randomInt(0, 10 ** otpLength)
      .toString()
      .padStart(otpLength, '0');
    const expiresInMinutes =
      this.config.get<number>('otp.expiresInMinutes') ?? 5;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const appName = this.config.get<string>('app.name');

    try {
      await this.mail.send(
        destination,
        `${appName} — ${subject}`,
        `Your verification code is ${code}. It will expire in ${expiresInMinutes} minutes.`,
      );
    } catch {
      throw new HttpException(
        'Failed to send the verification email. Please try again shortly.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    await this.prisma.otp.upsert({
      where: { destination_otpType: { destination, otpType } },
      create: { destination, otpType, otp: code, expirationTime: expiresAt },
      update: { otp: code, attempts: 0, expirationTime: expiresAt },
    });

    const exposeOtp = this.config.get<boolean>('otp.exposeInResponse');
    return {
      destination,
      expiresAt,
      resendAvailableAt: new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000),
      ...(exposeOtp ? { otp: code } : {}),
    };
  }

  async consume(
    destination: string,
    otpType: OtpType,
    code: string,
  ): Promise<string> {
    const record = await this.prisma.otp.findUnique({
      where: { destination_otpType: { destination, otpType } },
    });
    if (!record) throw new BadRequestException('Invalid or expired OTP');

    const remainingMs = record.expirationTime.getTime() - Date.now();
    if (remainingMs <= 0) {
      await this.prisma.otp.delete({ where: { id: record.id } });
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    if (record.otp !== code) {
      const attempts = record.attempts + 1;
      if (attempts >= MAX_OTP_ATTEMPTS) {
        await this.prisma.otp.delete({ where: { id: record.id } });
        throw new HttpException(
          'Too many incorrect attempts. Please request a new OTP.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      await this.prisma.otp.update({
        where: { id: record.id },
        data: { attempts },
      });
      throw new BadRequestException(
        `Incorrect OTP. ${MAX_OTP_ATTEMPTS - attempts} attempt(s) left.`,
      );
    }

    return record.id;
  }
}
