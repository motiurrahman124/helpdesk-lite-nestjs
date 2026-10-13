import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserStatus } from '../generated/prisma/client.js';
import { SessionService } from '../auth/session.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  profileImage: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: profileSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const phone = dto.phone?.trim();
    if (phone) {
      const taken = await this.prisma.user.findFirst({
        where: { phone, deletedAt: null, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name?.trim(), phone, profileImage: dto.profileImage },
      select: profileSelect,
    });
  }

  async remove(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: UserStatus.INACTIVE,
        email: `deleted.${userId}@users.invalid`,
        phone: null,
        passwordHash: '',
      },
    });
    await this.sessionService.revokeAllForUser(userId);
  }
}
