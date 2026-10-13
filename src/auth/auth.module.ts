import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { JwtUtilsService } from './jwt.service.js';
import { OtpService } from './otp.service.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    AuthGuard,
    JwtUtilsService,
    OtpService,
    SessionService,
  ],
  exports: [AuthCookieService, AuthGuard, JwtUtilsService, SessionService],
})
export class AuthModule {}
