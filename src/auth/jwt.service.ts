import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { SessionService } from './session.service.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sid?: string;
}

@Injectable()
export class JwtUtilsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  async generateTokens(payload: Omit<JwtPayload, 'sid'>) {
    const sid = await this.sessionService.create(payload.userId);
    return this.signPair({ ...payload, sid });
  }

  signPair(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.secret('jwt.secret'),
      expiresIn: this.config.get<StringValue>('jwt.expiresIn'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.secret('jwt.refreshSecret'),
      expiresIn: this.config.get<StringValue>('jwt.refreshExpiresIn'),
    });
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.secret('jwt.secret'),
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.secret('jwt.refreshSecret'),
    });
  }

  private secret(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) throw new Error(`${key} is not configured`);
    return value;
  }
}
