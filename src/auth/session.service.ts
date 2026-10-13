import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string): Promise<string> {
    const session = await this.prisma.session.create({
      data: { userId, expiresAt: this.expiry() },
      select: { id: true },
    });
    return session.id;
  }

  async touch(sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { expiresAt: this.expiry() },
    });
  }

  async isActive(sessionId: string): Promise<boolean> {
    const count = await this.prisma.session.count({
      where: { id: sessionId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    return count > 0;
  }

  async revoke(sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private expiry(): Date {
    const ttlMs = this.config.get<number>('cookie.refreshTokenMaxAge')!;
    return new Date(Date.now() + ttlMs);
  }
}
