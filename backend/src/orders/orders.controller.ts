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
  ) {
    return this.ordersService.findAll(
      req.user.userId,
      req.user.role,
      from,
      to,
      storeId,
      productId,
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
