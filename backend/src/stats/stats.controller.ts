import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/auth.types';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('my/sales')
  getMySalesStats(
    @Request() req: AuthRequest,
    @Query('range') range: 'today' | 'week' | 'month' = 'today',
  ) {
    return this.statsService.getMySalesStats(req.user.userId, range);
  }

  @Get('top/stores')
  getTopStores(
    @Query('range') range: 'today' | 'week' | 'month' = 'month',
    @Query('limit') limit = '10',
  ) {
    return this.statsService.getTopStores(range, Number(limit));
  }

  @Get('top/products')
  getTopProducts(
    @Query('range') range: 'today' | 'week' | 'month' = 'month',
    @Query('limit') limit = '10',
  ) {
    return this.statsService.getTopProducts(range, Number(limit));
  }
}
