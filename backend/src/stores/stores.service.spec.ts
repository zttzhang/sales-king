import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StoresService', () => {
  let service: StoresService;
  let prisma: PrismaService;

  const mockPrismaService = {
    store: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockStore = {
    id: 'store-123',
    name: 'Main Store',
    code: 'MAIN01',
    address: '123 Main St',
    city: 'New York',
    regionId: 'region-123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a store', async () => {
      const createDto = {
        name: 'Main Store',
        code: 'MAIN01',
        address: '123 Main St',
        city: 'New York',
        regionId: 'region-123',
      };

      mockPrismaService.store.create.mockResolvedValue(mockStore);

      const result = await service.create(createDto);

      expect(mockPrismaService.store.create).toHaveBeenCalledWith({
        reateDto,
      });
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      const stores = [mockStore];
      mockPrismaService.store.findMany.mockResolvedValue(stores);

      const result = await service.findAll();

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
        include: { region: true },
      });
      expect(result).toEqual(stores);
    });

    it('should filter stores by regionId', async () => {
      const stores = [mockStore];
      mockPrismaService.store.findMany.mockResolvedValue(stores);

      await service.findAll(undefined, 'region-123');

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: { regionId: 'region-123' },
        orderBy: { name: 'asc' },
        include: { region: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      const result = await service.findOne('store-123');

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: 'store-123' },
        include: { region: true },
      });
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store does not exist', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const updateDto = { name: 'Updated Store' };
      const updatedStore = { ...mockStore, ...updateDto };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(updatedStore);

      const result = await service.update('store-123', updateDto);

      expect(mockPrismaService.store.update).toHaveBeenCalledWith({
        where: { id: 'store-123' },
        data: updateDto,
      });
      expect(result).toEqual(updatedStore);
    });

    it('should throw NotFoundException if store does not exist', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a store', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.delete.mockResolvedValue(mockStore);

      await service.remove('store-123');

      expect(mockPrismaService.store.delete).toHaveBeenCalledWith({
        where: { id: 'store-123' },
      });
    });

    it('should throw NotFoundException if store does not exist', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
