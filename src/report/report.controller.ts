import { Controller, Get, Param } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('by-role')
  async countByRole() {
    return this.reportService.countUsersByRole();
  }

  @Get('average-age')
  async averageAge() {
    return this.reportService.averageAgeByRole();
  }

  @Get('deleted-active')
  async deletedActive() {
    return this.reportService.deletedVsActive();
  }

  @Get('newest-users/:count')
  async newestUsers(@Param('count') count: number) {
    return this.reportService.newestUsersCount(count);
  }

  @Get('usersByMonthYear')
  async usersByMonthYear() {
    return this.reportService.usersGroupedByMonthYear();
  }
}
