import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { UsersService } from './users.service';

/**
 * Profile controller — authenticated users manage their own profile.
 * OwnershipGuard prevents IDOR: users can only modify their own profile.
 *
 * Lab 06 target: In stateless mode, attacker can bypass OwnershipGuard
 * by forging a JWT with another user's sub.
 */
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /profile/me — Get own profile */
  @Get('me')
  getMe(@Request() req) {
    return this.usersService.findProfile(req.user.sub);
  }

  /** PATCH /profile/:userId — Update profile (ownership enforced) */
  @Patch(':userId')
  @UseGuards(OwnershipGuard) // user.sub must match :userId, or user is admin
  updateProfile(
    @Param('userId') userId: string,
    @Body() updateData: { bio?: string; avatar_url?: string },
  ) {
    return this.usersService.updateProfile(userId, updateData);
  }
}
