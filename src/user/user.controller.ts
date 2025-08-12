import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUserDto, LoginUserDto, RegisterUserDto } from './utils/user.dto';
import { UserService } from './user.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and return access token' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

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
  async usersList(@Query() query: GetUserDto) {
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
  @ApiBearerAuth() // Requires JWT token in Swagger
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
