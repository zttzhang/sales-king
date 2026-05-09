import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySalesStats(userId: string, range: 'today' | 'week' | 'month') {
    const { startDate } = this.getDateRange(range);
    const orders = await this.prisma.salesOrder.findMany({
      where: { createdByUserId: userId, orderDate: { gte: startDate } },
      include: { lines: true },
    });

    const salesAmount = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const ordersCount = orders.length;
    const totalQty = orders.reduce(
      (sum, order) => sum + Number(order.totalQty),
      0,
    );

    return { salesAmount, ordersCount, totalQty, range };
  }

  async getTopStores(range: 'today' | 'week' | 'month', limit: number) {
    const { startDate } = this.getDateRange(range);
    const grouped = await this.prisma.salesOrder.groupBy({
      by: ['storeId'],
      where: { orderDate: { gte: startDate } },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    return Promise.all(
      grouped.map(async (item) => ({
        store: await this.prisma.store.findUnique({
          where: { id: item.storeId },
        }),
        totalAmount: Number(item._sum.totalAmount ?? 0),
        ordersCount: item._count.id,
      })),
    );
  }

  async getTopProducts(range: 'today' | 'week' | 'month', limit: number) {
    const { startDate } = this.getDateRange(range);
    const grouped = await this.prisma.salesOrderLine.groupBy({
      by: ['productId'],
      where: { order: { orderDate: { gte: startDate } } },
      _sum: { qty: true, lineAmount: true },
      orderBy: { _sum: { lineAmount: 'desc' } },
      take: limit,
    });
    return Promise.all(
      grouped.map(async (item) => ({
        product: await this.prisma.product.findUnique({
          where: { id: item.productId },
        }),
        totalQuantity: Number(item._sum.qty ?? 0),
        totalAmount: Number(item._sum.lineAmount ?? 0),
      })),
    );
  }

  private getDateRange(range: 'today' | 'week' | 'month') {
    const now = new Date();
    const startDate = new Date(now);
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week': {
        const day = now.getDay();
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    return { startDate, endDate: now };
  }
}
