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
import { UserRole } from 'src/utils/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get('list')
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
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  async updateUserPut(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<RegisterUserDto>,
  ) {
    return this.userService.updateUserPut(id, updateUserDto);
  }

  @Patch(':id')
  async updateUserPatch(
    @Param('id') id: string,
    @Body() partialUpdateDto: Partial<RegisterUserDto>,
  ) {
    return this.userService.updateUserPatch(id, partialUpdateDto);
  }

  @Patch(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.userService.softDeleteUser(id);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async permanentDelete(@Param('id') id: string) {
    return this.userService.permanentDeleteUser(id);
  }
}
