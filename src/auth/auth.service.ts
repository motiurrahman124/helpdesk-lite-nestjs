import crypto from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { OtpType, UserStatus, type User } from '../generated/prisma/client.js';
import { inactiveStatusMessage } from '../common/utils/account-status.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ChangePasswordDto,
  IdentityDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyPasswordResetOtpDto,
  VerifyRegistrationDto,
} from './dto/auth.dto.js';
import { JwtUtilsService } from './jwt.service.js';
import { OtpService } from './otp.service.js';
import { SessionService } from './session.service.js';

const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;
const USER_ROLE = 'USER';
const RESET_EXPIRED =
  'Password reset session has expired. Please request a new OTP.';

type Identifier = { email: string } | { phone: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtUtils: JwtUtilsService,
    private readonly sessionService: SessionService,
    private readonly otp: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);
    const phone = dto.phone.trim();

    const holders = await this.prisma.user.findMany({
      where: { deletedAt: null, OR: [{ email }, { phone }] },
      select: { id: true, email: true, phone: true, emailVerifiedAt: true },
    });
    const emailHolder = holders.find((holder) => holder.email === email);
    const phoneHolder = holders.find((holder) => holder.phone === phone);

    if (emailHolder?.emailVerifiedAt) {
      throw new ConflictException('An account with this email already exists');
    }
    if (phoneHolder?.emailVerifiedAt) {
      throw new ConflictException(
        'An account with this phone number already exists',
      );
    }

    const details = {
      name: dto.name.trim(),
      phone,
      passwordHash: await this.hashPassword(dto.password),
    };

    await this.prisma.$transaction(async (tx) => {
      if (phoneHolder && phoneHolder.id !== emailHolder?.id) {
        await tx.user.update({
          where: { id: phoneHolder.id },
          data: { phone: null },
        });
      }
      if (emailHolder) {
        await tx.user.update({ where: { id: emailHolder.id }, data: details });
      } else {
        await tx.user.create({ data: { ...details, email } });
      }
    });

    return this.otp.send(email, OtpType.REGISTRATION, 'Verify your email');
  }

  async resendRegistrationOtp(rawEmail: string) {
    const account = await this.findPendingRegistration(rawEmail);
    return this.otp.send(
      account.email,
      OtpType.REGISTRATION,
      'Verify your email',
    );
  }

  async verifyRegistration(dto: VerifyRegistrationDto) {
    const account = await this.findPendingRegistration(dto.email);
    const otpId = await this.otp.consume(
      account.email,
      OtpType.REGISTRATION,
      dto.otp,
    );

    const [activated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: account.id },
        data: { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
      }),
      this.prisma.otp.delete({ where: { id: otpId } }),
    ]);
    return this.issueSession(activated);
  }

  async login(dto: LoginDto) {
    const identifier = parseIdentifier(dto.identifier);
    const account = await this.findAccount(identifier);

    if (
      !account ||
      !(await bcrypt.compare(dto.password, account.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!account.emailVerifiedAt) {
      throw new ForbiddenException(
        'Email is not verified. Please verify your email to finish creating your account.',
      );
    }
    assertActive(account);
    return this.issueSession(account);
  }

  async forgotPassword(dto: IdentityDto) {
    const account = await this.findVerifiedAccount(dto.identifier);
    const sent = await this.otp.send(
      account.email,
      OtpType.PASSWORD_RESET,
      'Reset your password',
    );
    return { ...sent, destination: maskEmail(account.email) };
  }

  async verifyPasswordResetOtp(dto: VerifyPasswordResetOtpDto) {
    const account = await this.findVerifiedAccount(dto.identifier);
    const otpId = await this.otp.consume(
      account.email,
      OtpType.PASSWORD_RESET,
      dto.otp,
    );

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.prisma.$transaction([
      this.prisma.otp.delete({ where: { id: otpId } }),
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: account.id },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: account.id,
          tokenHash: hashToken(resetToken),
          expiresAt,
        },
      }),
    ]);
    return { resetToken, expiresAt };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(dto.resetToken) },
    });
    if (!token || token.expiresAt <= new Date()) {
      throw new BadRequestException(RESET_EXPIRED);
    }

    const passwordHash = await this.hashPassword(dto.password);

    const consumed = await this.prisma.passwordResetToken.deleteMany({
      where: { id: token.id, expiresAt: { gt: new Date() } },
    });
    if (consumed.count !== 1) throw new BadRequestException(RESET_EXPIRED);

    const account = await this.prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash },
    });
    await this.sessionService.revokeAllForUser(account.id);
    assertActive(account);
    return this.issueSession(account);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const account = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('User not found');

    if (!(await bcrypt.compare(dto.currentPassword, account.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    await this.prisma.user.update({
      where: { id: account.id },
      data: { passwordHash: await this.hashPassword(dto.newPassword) },
    });
    await this.sessionService.revokeAllForUser(account.id);
    return this.issueSession(account);
  }

  async refreshToken(refreshToken: string) {
    let payload;
    try {
      payload = this.jwtUtils.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(inactiveStatusMessage(user.status));
    }
    if (!payload.sid || !(await this.sessionService.isActive(payload.sid))) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    await this.sessionService.touch(payload.sid);
    return this.jwtUtils.signPair({
      userId: user.id,
      email: user.email,
      role: USER_ROLE,
      sid: payload.sid,
    });
  }

  private async issueSession(account: User) {
    const tokens = await this.jwtUtils.generateTokens({
      userId: account.id,
      email: account.email,
      role: USER_ROLE,
    });
    await this.prisma.user.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        profileImage: account.profileImage,
        role: USER_ROLE,
        status: account.status,
        emailVerifiedAt: account.emailVerifiedAt,
      },
      ...tokens,
    };
  }

  private async findPendingRegistration(rawEmail: string): Promise<User> {
    const account = await this.findAccount({ email: normalizeEmail(rawEmail) });
    if (!account) {
      throw new NotFoundException(
        'No pending registration found for this email',
      );
    }
    if (account.emailVerifiedAt) {
      throw new ConflictException(
        'This email is already verified. Please log in.',
      );
    }
    return account;
  }

  private async findVerifiedAccount(rawIdentifier: string): Promise<User> {
    const account = await this.findAccount(parseIdentifier(rawIdentifier));
    if (!account?.emailVerifiedAt) {
      throw new NotFoundException(
        'No account found for this email or phone number',
      );
    }
    return account;
  }

  private findAccount(identifier: Identifier): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { ...identifier, deletedAt: null },
    });
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      this.config.get<number>('jwt.bcryptRounds') ?? 10,
    );
  }
}

function parseIdentifier(raw: string): Identifier {
  const value = raw.trim();
  if (value.includes('@')) {
    if (!EMAIL_PATTERN.test(value)) {
      throw new BadRequestException('Invalid email address');
    }
    return { email: normalizeEmail(value) };
  }
  if (!PHONE_PATTERN.test(value)) {
    throw new BadRequestException(
      'Invalid phone number. Use international format including country code, e.g. +966501234567',
    );
  }
  return { phone: value };
}

function assertActive(account: User) {
  if (account.status !== UserStatus.ACTIVE) {
    throw new ForbiddenException(inactiveStatusMessage(account.status));
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
