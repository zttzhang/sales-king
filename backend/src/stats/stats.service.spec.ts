import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    salesOrder: {
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    visit: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    customer: {
      count: jest.fn(),
    },
    store: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesOverview', () => {
    it('should return sales overview for SALES role', async () => {
      const mockAggregateResult = {
        _sum: { totalAmount: 10000 },
        _count: { id: 50 },
      };

      mockPrismaService.salesOrder.aggregate.mockResolvedValue(
        mockAggregateResult,
      );
      mockPrismaService.visit.count.mockResolvedValue(30);

      const result = await service.getSalesOverview('user-123', 'SALES');

      expect(mockPrismaService.salesOrder.aggregate).toHaveBeenCalledWith({
        where: { createdByUserId: 'user-123' },
        _sum: { totalAmount: true },
        _count: { id: true },
      });
      expect(result).toEqual({
        totalSales: 10000,
        orderCount: 50,
        visitCount: 30,
      });
    });

    it('should return sales overview for ADMIN role', async () => {
      const mockAggregateResult = {
        _sum: { totalAmount: 50000 },
        _count: { id: 200 },
      };

      mockPrismaService.salesOrder.aggregate.mockResolvedValue(
        mockAggregateResult,
      );
      mockPrismaService.visit.count.mockResolvedValue(150);

      const result = await service.getSalesOverview('admin-123', 'ADMIN');

      expect(mockPrismaService.salesOrder.aggregate).toHaveBeenCalledWith({
        where: {},
        _sum: { totalAmount: true },
        _count: { id: true },
      });
      expect(result).toEqual({
        totalSales: 50000,
        orderCount: 200,
        visitCount: 150,
      });
    });
  });

  describe('getTopProducts', () => {
    it('should return top selling products', async () => {
      const mockGroupByResult = [
        {
          productId: 'product-1',
          _sum: { qty: 100, lineAmount: 5000 },
        },
        {
          productId: 'product-2',
          _sum: { qty: 80, lineAmount: 4000 },
        },
      ];

      mockPrismaService.salesOrder.groupBy.mockResolvedValue(const result = await service.getTopProducts('user-123', 'SALES', 10);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('productId', 'product-1');
    });
  });
});

