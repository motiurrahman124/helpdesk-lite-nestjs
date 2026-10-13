import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UserStatus } from '../generated/prisma/client.js';
import { inactiveStatusMessage } from '../common/utils/account-status.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { JwtUtilsService } from './jwt.service.js';
import { SessionService } from './session.service.js';

export function extractAccessToken(req: Request): string | undefined {
  const [type, token] = req.headers.authorization?.split(' ') ?? [];
  if (type === 'Bearer' && token) return token;
  return req.cookies?.['accessToken'];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtils: JwtUtilsService,
    private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
    private readonly cookies: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const token = extractAccessToken(request);
    if (!token) throw new UnauthorizedException('Authentication failed!');

    let payload;
    try {
      payload = this.jwtUtils.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (!payload.sid || !(await this.sessionService.isActive(payload.sid))) {
      this.cookies.clear(response);
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
    });
    if (!user) {
      this.cookies.clear(response);
      throw new UnauthorizedException('User not found!');
    }
    if (user.status !== UserStatus.ACTIVE) {
      this.cookies.clear(response);
      throw new ForbiddenException(inactiveStatusMessage(user.status));
    }

    (request as Request & { user: typeof user }).user = user;
    return true;
  }
}
