import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService) {}

  set(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('accessToken', tokens.accessToken, {
      ...this.options(),
      maxAge: this.config.get<number>('cookie.accessTokenMaxAge'),
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...this.options(),
      maxAge: this.config.get<number>('cookie.refreshTokenMaxAge'),
    });
  }

  clear(res: Response) {
    res.clearCookie('accessToken', this.options());
    res.clearCookie('refreshToken', this.options());
  }

  private options(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<boolean>('cookie.secure'),
      sameSite: this.config.get<'strict' | 'lax' | 'none'>('cookie.sameSite'),
      domain: this.config.get<string>('cookie.domain'),
    };
  }
}
