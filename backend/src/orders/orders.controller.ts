import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/auth.types';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('storeId') storeId?: string,
    @Query('productId') productId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    return this.ordersService.findAllWithCount(
      req.user.userId,
      req.user.role,
      from,
      to,
      storeId,
      productId,
      pageNum,
      pageSizeNum,
    );
  }

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: AuthRequest) {
    return this.ordersService.create(dto, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.ordersService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Request() req: AuthRequest,
  ) {
    return this.ordersService.update(id, dto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.ordersService.remove(id, req.user.userId, req.user.role);
  }
}
