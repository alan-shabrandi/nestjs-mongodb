import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/decorator';

@ApiTags('Reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('by-role')
  @ApiOperation({ summary: 'Count users grouped by role' })
  @ApiResponse({
    status: 200,
    description: 'Returns count of users grouped by their role',
  })
  async countByRole() {
    return this.reportService.countUsersByRole();
  }

  @Get('average-age')
  @ApiOperation({ summary: 'Get average age of users grouped by role' })
  @ApiResponse({
    status: 200,
    description: 'Returns the average age of users per role',
  })
  async averageAge() {
    return this.reportService.averageAgeByRole();
  }

  @Get('deleted-active')
  @ApiOperation({ summary: 'Count deleted vs active users' })
  @ApiResponse({
    status: 200,
    description: 'Returns counts of deleted and active users',
  })
  async deletedActive() {
    return this.reportService.deletedVsActive();
  }

  @Get('newest-users/:count')
  @ApiOperation({ summary: 'Get newest users' })
  @ApiParam({
    name: 'count',
    type: Number,
    description: 'Number of newest users to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the newest users limited by count',
  })
  async newestUsers(@Param('count') count: number) {
    return this.reportService.newestUsersCount(count);
  }

  @Get('usersByMonthYear')
  @ApiOperation({
    summary: 'Get user creation stats grouped by month and year',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the number of users created each month/year',
  })
  async usersByMonthYear() {
    return this.reportService.usersGroupedByMonthYear();
  }
}
