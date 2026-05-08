import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCustomer = {
    id: 'customer-123',
    name: 'John Doe',
    phone: '1234567890',
    address: '123 Main St',
    city: 'New York',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createDto = {
        name: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
      };

      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create(createDto);

      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        reateDto,
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const customers = [mockCustomer];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(customers);
    });

    it('should filter customers by keyword', async () => {
      const customers = [mockCustomer];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      await service.findAll('John');

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'John', mode: 'insensitive' } },
            { phone: { contains: 'John', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.findOne('customer-123');

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto = { name: 'Jane Doe' };
      const updatedCustomer = { ...mockCustomer, ...updateDto };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue(updatedCustomer);

      const result = await service.update('customer-123', updateDto);

      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
        pdateDto,
      });
      expect(result).toEqual(updatedCustomer);
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.delete.mockResolvedValue(mockCustomer);

      await service.remove('customer-123');

      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
      });
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
