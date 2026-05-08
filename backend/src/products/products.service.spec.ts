import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockProduct = {
    id: 'product-123',
    name: 'Product A',
    sku: 'PROD-A',
    description: 'Test product',
    productLine: 'Electronics',
    unitPrice: 99.99,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'Product A',
        sku: 'PROD-A',
        description: 'Test product',
        productLine: 'Electronics',
        unitPrice: 99.99,
      };

      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
         createDto,
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(products);
    });

    it('should filter products by keyword', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      await service.findAll('Product');

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Product', mode: 'insensitive' } },
            { productLine: { contains: 'Product', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter products by productLine', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      await service.findAll(undefined, 'Electronics');

      expect(mock