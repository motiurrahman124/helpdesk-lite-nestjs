import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthCookieService } from '../auth/auth-cookie.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { successResponse } from '../common/utils/api-response.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cookies: AuthCookieService,
  ) {}

  @ApiOperation({ summary: 'Get the signed-in user profile' })
  @Get('profile')
  async getProfile(@GetUser('id') userId: string) {
    return successResponse(
      'Data retrieved successfully',
      await this.usersService.getProfile(userId),
    );
  }

  @ApiOperation({ summary: 'Update name, phone, or profile image' })
  @Patch('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return successResponse(
      'Profile updated successfully',
      await this.usersService.updateProfile(userId, dto),
    );
  }

  @ApiOperation({
    summary: 'Delete the signed-in account and end all its sessions',
  })
  @Delete('profile')
  async remove(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.remove(userId);
    this.cookies.clear(res);
    return successResponse('User deleted successfully');
  }
}
