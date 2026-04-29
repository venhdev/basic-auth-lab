import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { UsersService } from './users.service';

/**
 * Admin-only controller for user management.
 * All routes require: valid JWT + ADMIN role.
 * Feature flag RBAC_VERIFICATION_STRATEGY controls stateless/stateful role check.
 */
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /admin/users — List all users with their roles */
  @Get()
  findAll() {
    return this.usersService.findAllWithRoles();
  }

  /** PATCH /admin/users/:id/roles — Update a user's roles (by role IDs) */
  @Patch(':id/roles')
  updateRoles(
    @Param('id') id: string,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.usersService.updateUserRoles(id, roleIds);
  }
}
