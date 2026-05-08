import { Test, TestingModule } from '@nestjs/testing';
import { RegionsService } from './regions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RegionsService', () => {
  let service: RegionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    region: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockRegion = {
    id: 'region-123',
    name: 'North Region',
    code: 'NORTH',
    description: 'Northern sales region',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a region', async () => {
      const createDto = {
        name: 'North Region',
        code: 'NORTH',
        description: 'Northern sales region',
      };

      mockPrismaService.region.create.mockResolvedValue(mockRegion);

      const result = await service.create(createDto);

      expect(mockPrismaService.region.create).toHaveBeenCalledWith({
        reateDto,
      });
      expect(result).toEqual(mockRegion);
    });
  });

  describe('findAll', () => {
    it('should return all regions', async () => {
      const regions = [mockRegion];
      mockPrismaService.region.findMany.mockResolvedValue(regions);

      const result = await service.findAll();

      expect(mockPrismaService.region.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(regions);
    });
  });

  describe('findOne', () => {
    it('should return a region by id', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);

      const result = await service.findOne('region-123');

      expect(mockPrismaService.region.findUnique).toHaveBeenCalledWith({
        where: { id: 'region-123' },
      });
      expect(result).toEqual(mockRegion);
    });

    it('should throw NotFoundException if region does not exist', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a region', async () => {
      const updateDto = { name: 'Updated North Region' };
      const updatedRegion = { ...mockRegion, ...updateDto };

      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.update.mockResolvedValue(updatedRegion);

      const result = await service.update('region-123', updateDto);

      expect(mockPrismaService.region.update).toHaveBeenCalledWith({
        where: { id: 'region-123' },
        pdateDto,
      });
      expect(result).toEqual(updatedRegion);
    });

    it('should throw NotFoundException if region does not exist', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a region', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.delete.mockResolvedValue(mockRegion);

      await service.remove('region-123');

      expect(mockPrismaService.region.delete).toHaveBeenCalledWith({
        where: { id: 'region-123' },
      });
    });

    it('should throw NotFoundException if region does not exist', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
