import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string) {
    if (!dto.lines || dto.lines.length === 0) {
      throw new BadRequestException(
        'Order must include at least one line item',
      );
    }

    const lines = dto.lines.map((item) => {
      const qty = item.qty;
      const price = item.price;
      const discountAmount = item.discountAmount ?? 0;

      // Validate quantity is positive
      if (qty <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      // Calculate line amount
      const lineAmount = item.lineAmount ?? (qty * price - discountAmount);

      return {
        productId: item.productId,
        qty,
        unitPrice: price,
        discountAmount,
        lineAmount,
      };
    });

    const totalAmount = lines.reduce((sum, item) => sum + item.lineAmount, 0);
    const totalQty = lines.reduce((sum, item) => sum + item.qty, 0);

    return this.prisma.salesOrder.create({
      data: {
        storeId: dto.storeId,
        customerId: dto.customerId,
        createdByUserId: userId,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
        notes: dto.notes,
        totalAmount,
        totalQty,
        status: (dto.status as any) || 'PENDING',
        lines: {
          create: lines,
        },
      },
      include: {
        store: true,
        customer: true,
        createdBy: true,
        lines: { include: { product: true } },
      },
    });
  }

  async findAll(
    userId: string,
    userRole: string,
    from?: string,
    to?: string,
    storeId?: string,
    productId?: string,
  ) {
    const where: Prisma.SalesOrderWhereInput = {};
    if (userRole === 'SALES') {
      where.createdByUserId = userId;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (from || to) {
      where.orderDate = {};
      if (from) where.orderDate.gte = new Date(from);
      if (to) where.orderDate.lte = new Date(to);
    }
    if (productId) {
      where.lines = { some: { productId } };
    }
    return this.prisma.salesOrder.findMany({
      where,
      include: {
        store: true,
        customer: true,
        createdBy: true,
        lines: { include: { product: true } },
      },
      orderBy: { orderDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        createdBy: true,
        lines: { include: { product: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (userRole === 'SALES' && order.createdByUserId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }

  async update(
    id: string,
    dto: UpdateOrderDto,
    userId: string,
    userRole: string,
  ) {
    await this.findOne(id, userId, userRole);
    const data: Prisma.SalesOrderUpdateInput = {};
    if (dto.storeId) {
      data.store = { connect: { id: dto.storeId } };
    }
    if (dto.customerId !== undefined) {
      data.customer = { connect: { id: dto.customerId } };
    }
    if (dto.orderDate) data.orderDate = new Date(dto.orderDate);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status) data.status = dto.status as any;

    if (dto.lines) {
      const lines = dto.lines.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.price,
        discountAmount: item.discountAmount ?? 0,
        lineAmount: item.lineAmount ?? (item.qty * item.price - (item.discountAmount ?? 0)),
      }));
      const totalAmount = lines.reduce((sum, item) => sum + item.lineAmount, 0);
      const totalQty = lines.reduce((sum, item) => sum + item.qty, 0);
      data.totalAmount = totalAmount;
      data.totalQty = totalQty;
      data.lines = {
        deleteMany: {},
        create: lines,
      };
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data,
      include: {
        store: true,
        customer: true,
        createdBy: true,
        lines: { include: { product: true } },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole);
    return this.prisma.salesOrder.delete({ where: { id } });
  }

  async findAllWithCount(
    userId: string,
    userRole: string,
    from?: string,
    to?: string,
    storeId?: string,
    productId?: string,
    page = 1,
    pageSize = 20,
  ) {
    const where: Prisma.SalesOrderWhereInput = {};
    if (userRole === 'SALES') {
      where.createdByUserId = userId;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (from || to) {
      where.orderDate = {};
      if (from) where.orderDate.gte = new Date(from);
      if (to) where.orderDate.lte = new Date(to);
    }
    if (productId) {
      where.lines = { some: { productId } };
    }

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          store: true,
          customer: true,
          createdBy: true,
          lines: { include: { product: true } },
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
