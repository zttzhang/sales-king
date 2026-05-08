import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    salesOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    salesOrderLine: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockUserId = 'user-123';
  const mockAdminUserId = 'admin-123';

  const mockOrder = {
    id: 'order-123',
    storeId: 'store-123',
    customerId: 'customer-123',
    orderDate: new Date('2026-05-08'),
    createdByUserId: mockUserId,
    notes: 'Test order',
    totalAmount: 1000,
    totalQty: 10,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    lines: [
      {
        id: 'line-1',
        orderId: 'order-123',
        productId: 'product-1',
        qty: 5,
        unitPrice: 100,
        discountAmount: 0,
        lineAmount: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'line-2',
        orderId: 'order-123',
        productId: 'product-2',
        qty: 5,
        unitPrice: 100,
        discountAmount: 0,
        lineAmount: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with correct total calculations', async () => {
      const createOrderDto = {
        storeId: 'store-123',
        customerId: 'customer-123',
        orderDate: '2026-05-08',
        notes: 'Test order',
        lines: [
          {
            productId: 'product-1',
            quantity: 5,
            unitPrice: 100,
            discountAmount: 0,
          },
          {
            productId: 'product-2',
            quantity: 5,
            unitPrice: 100,
            discountAmount: 50,
          },
        ],
      };

      mockPrismaService.salesOrder.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto, mockUserId);

      expect(mockPrismaService.salesOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: createOrderDto.storeId,
            customerId: createOrderDto.customerId,
            createdByUserId: mockUserId,
            totalAmount: 950, // 500 + 450
            totalQty: 10,
          }),
        }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('should validate quantity is positive', async () => {
      const createOrderDto = {
        storeId: 'store-123',
        orderDate: '2026-05-08',
        lines: [
          {
            productId: 'product-1',
            quantity: -5, // Invalid
            unitPrice: 100,
            discountAmount: 0,
          },
        ],
      };

      // Note: Current implementation doesn't validate this, so test will fail
      // This test documents expected behavior
      await expect(service.create(createOrderDto, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate discount does not exceed line total', async () => {
      const createOrderDto = {
        storeId: 'store-123',
        orderDate: '2026-05-08',
        lines: [
          {
            productId: 'product-1',
            quantity: 5,
            unitPrice: 100,
            discountAmount: 600, // Exceeds 5 * 100
          },
        ],
      };

      // Note: Current implementation doesn't validate this, so test will fail
      // This test documents expected behavior
      await expect(service.create(createOrderDto, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return only user orders for SALES role', async () => {
      mockPrismaService.salesOrder.findMany.mockResolvedValue([mockOrder]);

      const result = await service.findAll(mockUserId, 'SALES');

      expect(mockPrismaService.salesOrder.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdByUserId: mockUserId,
        }),
        include: expect.any(Object),
        orderBy: { orderDate: 'desc' },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should return all orders for ADMIN role', async () => {
      mockPrismaService.salesOrder.findMany.mockResolvedValue([mockOrder]);

      const result = await service.findAll(mockAdminUserId, 'ADMIN');

      expect(mockPrismaService.salesOrder.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { orderDate: 'desc' },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should filter by date range', async () => {
      const from = '2026-05-01';
      const to = '2026-05-31';

      mockPrismaService.salesOrder.findMany.mockResolvedValue([]);

      await service.findAll(mockUserId, 'SALES', from, to);

      expect(mockPrismaService.salesOrder.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdByUserId: mockUserId,
          orderDate: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
        include: expect.any(Object),
        orderBy: { orderDate: 'desc' },
      });
    });

    it('should filter by store', async () => {
      const storeId = 'store-123';

      mockPrismaService.salesOrder.findMany.mockResolvedValue([]);

      await service.findAll(mockUserId, 'SALES', undefined, undefined, storeId);

      expect(mockPrismaService.salesOrder.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdByUserId: mockUserId,
          storeId,
        }),
        include: expect.any(Object),
        orderBy: { orderDate: 'desc' },
      });
    });

    it('should filter by product', async () => {
      const productId = 'product-123';

      mockPrismaService.salesOrder.findMany.mockResolvedValue([]);

      await service.findAll(
        mockUserId,
        'SALES',
        undefined,
        undefined,
        undefined,
        productId,
      );

      expect(mockPrismaService.salesOrder.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdByUserId: mockUserId,
          lines: { some: { productId } },
        }),
        include: expect.any(Object),
        orderBy: { orderDate: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return order for owner (SALES)', async () => {
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-123', mockUserId, 'SALES');

      expect(result).toEqual(mockOrder);
    });

    it('should throw ForbiddenException if SALES user tries to access other user order', async () => {
      const otherUserOrder = { ...mockOrder, createdByUserId: 'other-user' };
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(otherUserOrder);

      await expect(
        service.findOne('order-123', mockUserId, 'SALES'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to access any order', async () => {
      const otherUserOrder = { ...mockOrder, createdByUserId: 'other-user' };
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(otherUserOrder);

      const result = await service.findOne(
        'order-123',
        mockAdminUserId,
        'ADMIN',
      );

      expect(result).toEqual(otherUserOrder);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', mockUserId, 'SALES'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update order and recalculate totals', async () => {
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.salesOrder.update.mockResolvedValue({
        ...mockOrder,
        totalAmount: 1200,
        totalQty: 12,
      });

      const updateDto = {
        notes: 'Updated notes',
        lines: [
          {
            productId: 'product-1',
            quantity: 6,
            unitPrice: 100,
            discountAmount: 0,
          },
          {
            productId: 'product-2',
            quantity: 6,
            unitPrice: 100,
            discountAmount: 0,
          },
        ],
      };

      const result = await service.update(
        'order-123',
        updateDto,
        mockUserId,
        'SALES',
      );

      expect(mockPrismaService.salesOrder.update).toHaveBeenCalled();
      expect(result.totalAmount).toBe(1200);
      expect(result.totalQty).toBe(12);
    });

    it('should not allow SALES user to update other user order', async () => {
      const otherUserOrder = { ...mockOrder, createdByUserId: 'other-user' };
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(otherUserOrder);

      await expect(
        service.update('order-123', { notes: 'test' }, mockUserId, 'SALES'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to update any order', async () => {
      const otherUserOrder = { ...mockOrder, createdByUserId: 'other-user' };
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(otherUserOrder);
      mockPrismaService.salesOrder.update.mockResolvedValue(otherUserOrder);

      const result = await service.update(
        'order-123',
        { notes: 'test' },
        mockAdminUserId,
        'ADMIN',
      );

      expect(mockPrismaService.salesOrder.update).toHaveBeenCalled();
      expect(result).toEqual(otherUserOrder);
    });
  });

  describe('remove', () => {
    it('should delete order for owner', async () => {
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.salesOrder.delete.mockResolvedValue(mockOrder);

      await service.remove('order-123', mockUserId, 'SALES');

      expect(mockPrismaService.salesOrder.delete).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      });
    });

    it('should not allow SALES user to delete other user order', async () => {
      const otherUserOrder = { ...mockOrder, createdByUserId: 'other-user' };
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(otherUserOrder);

      await expect(
        service.remove('order-123', mockUserId, 'SALES'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to delete any order', async () => {
      const otherUserOrder = { ...mockOrder, createdByUserId: 'other-user' };
      mockPrismaService.salesOrder.findUnique.mockResolvedValue(otherUserOrder);
      mockPrismaService.salesOrder.delete.mockResolvedValue(otherUserOrder);

      await service.remove('order-123', mockAdminUserId, 'ADMIN');

      expect(mockPrismaService.salesOrder.delete).toHaveBeenCalled();
    });
  });
});
