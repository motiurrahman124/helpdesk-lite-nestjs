import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { successResponse } from '../common/utils/api-response.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthGuard, extractAccessToken } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import {
  ChangePasswordDto,
  EmailDto,
  IdentityDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyPasswordResetOtpDto,
  VerifyRegistrationDto,
} from './dto/auth.dto.js';
import { JwtUtilsService } from './jwt.service.js';
import { SessionService } from './session.service.js';

type SessionResult = {
  user: unknown;
  accessToken: string;
  refreshToken: string;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
    private readonly jwtUtils: JwtUtilsService,
    private readonly sessionService: SessionService,
  ) {}

  @ApiOperation({
    summary: 'Start sign-up and email a verification code',
    description:
      'Saves the account as PENDING. It becomes usable after `POST /auth/register/verify`. ' +
      'Submitting again for an unverified email replaces the pending details.',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return successResponse(
      'Verification code sent to your email',
      await this.authService.register(dto),
    );
  }

  @ApiOperation({
    summary: 'Resend the sign-up code (available 30s after the previous one)',
  })
  @Post('register/resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendRegistrationOtp(@Body() dto: EmailDto) {
    return successResponse(
      'Verification code resent',
      await this.authService.resendRegistrationOtp(dto.email),
    );
  }

  @ApiOperation({
    summary: 'Verify the sign-up code, activate the account, and sign in',
  })
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  async verifyRegistration(
    @Body() dto: VerifyRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.verifyRegistration(dto);
    return successResponse(
      'Account created successfully',
      this.startSession(res, session),
    );
  }

  @ApiOperation({
    summary: 'Sign in with email or phone',
    description:
      'Returns 401 for wrong credentials and 403 when the email is not verified or the account is not ACTIVE. ' +
      'Tokens are also set as httpOnly cookies.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const session = await this.authService.login(dto);
      return successResponse(
        'Login successful',
        this.startSession(res, session),
      );
    } catch (error) {
      this.cookies.clear(res);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Forgot password: email a reset code',
    description:
      'Accepts the email or phone of the account. The code always goes to the account email.',
  })
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: IdentityDto) {
    return successResponse(
      'Verification code sent to your email',
      await this.authService.forgotPassword(dto),
    );
  }

  @ApiOperation({
    summary: 'Verify the reset code and get a 10-minute reset token',
  })
  @Post('password/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(@Body() dto: VerifyPasswordResetOtpDto) {
    return successResponse(
      'OTP verified',
      await this.authService.verifyPasswordResetOtp(dto),
    );
  }

  @ApiOperation({
    summary: 'Set a new password and sign in',
    description: 'Consumes the reset token and signs out every other session.',
  })
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.resetPassword(dto);
    return successResponse(
      'Password updated successfully',
      this.startSession(res, session),
    );
  }

  @ApiOperation({
    summary: 'Change the password of the signed-in user',
    description: 'Signs out every session and returns fresh tokens.',
  })
  @ApiBearerAuth('access-token')
  @Patch('password')
  @UseGuards(AuthGuard)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.changePassword(userId, dto);
    return successResponse(
      'Password updated successfully',
      this.startSession(res, session),
    );
  }

  @ApiOperation({ summary: 'Rotate tokens using the refreshToken cookie' })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const tokens = await this.authService.refreshToken(refreshToken);
    this.cookies.set(res, tokens);
    return successResponse('Token refreshed successfully', {
      accessToken: tokens.accessToken,
    });
  }

  @ApiOperation({ summary: 'End the current session and clear its cookies' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = extractAccessToken(req);
    if (token) {
      try {
        const { sid } = this.jwtUtils.verifyAccessToken(token);
        if (sid) await this.sessionService.revoke(sid);
      } catch {
        // Expired or malformed token: still clear the cookies.
      }
    }
    this.cookies.clear(res);
    return successResponse('Logout successful');
  }

  @ApiOperation({ summary: 'End every session of the signed-in user' })
  @ApiBearerAuth('access-token')
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logoutAll(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.sessionService.revokeAllForUser(userId);
    this.cookies.clear(res);
    return successResponse('Logged out from all devices');
  }

  private startSession(res: Response, session: SessionResult) {
    this.cookies.set(res, session);
    return {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken:
        process.env.NODE_ENV === 'development' ? session.refreshToken : null,
    };
  }
}
