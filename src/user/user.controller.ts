import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUserDto } from './utils/user.dto';
import { UserService } from './user.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles, User } from 'src/auth/decorators/decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserDto } from 'src/auth/utils/auth.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: 'Get list of users with optional filters' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  async usersList(
    @Query() query: GetUserDto,
    @User() user: { userId: string; role: UserRole },
  ) {
    if (user.role === UserRole.Admin) {
      return this.userService.usersList(
        query.role as UserRole,
        query.search,
        query.page,
        query.limit,
        query.sortBy,
        query.order,
        query.fields,
        query.includeDeleted === 'true',
      );
    } else {
      return this.userService.usersList(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        [user.userId],
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (full update)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserPut(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<RegisterUserDto>,
  ) {
    return this.userService.updateUserPut(id, updateUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (partial update)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserPatch(
    @Param('id') id: string,
    @Body() partialUpdateDto: Partial<RegisterUserDto>,
  ) {
    return this.userService.updateUserPatch(id, partialUpdateDto);
  }

  @Patch(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User soft-deleted successfully' })
  async softDelete(@Param('id') id: string) {
    return this.userService.softDeleteUser(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Permanently delete user (Admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async permanentDelete(@Param('id') id: string) {
    return this.userService.permanentDeleteUser(id);
  }
}
