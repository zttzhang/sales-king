import { Test, TestingModule } from '@nestjs/testing';
import { VisitsService } from './visits.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('VisitsService', () => {
  let service: VisitsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    visit: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUserId = 'user-123';
  const mockAdminUserId = 'admin-123';

  const mockVisit = {
    id: 'visit-123',
    storeId: 'store-123',
    visitorUserId: mockUserId,
    visitTime: new Date('2026-05-08'),
    result: 'Successful visit',
    notes: 'Test visit notes',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a visit', async () => {
      const createDto = {
        storeId: 'store-123',
        visitTime: '2026-05-08',
        result: 'Successful visit',
        notes: 'Test visit notes',
      };

      mockPrismaService.visit.create.mockResolvedValue(mockVisit);

      const result = await service.create(createDto, mockUserId);

      expect(mockPrismaService.visit.create).toHaveBeenCalled();
      expect(result).toEqual(mockVisit);
    });
  });

  describe('findAll', () => {
    it('should return only user visits for SALES role', async () => {
      mockPrismaService.visit.findMany.mockResolvedValue([mockVisit]);

      const result = await service.findAll(mockUserId, 'SALES');

      expect(mockPrismaService.visit.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          visitorUserId: mockUserId,
        }),
        orderBy: { visitTime: 'desc' },
        include: expect.any(Object),
      });
      expect(result).toEqual([mockVisit]);
    });

    it('should return all visits for ADMIN role', async () => {
      mockPrismaService.visit.findMany.mockResolvedValue([mockVisit]);

      const result = await service.findAll(mockAdminUserId, 'ADMIN');

      expect(mockPrismaService.visit.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { visitTime: 'desc' },
        include: expect.any(Object),
      });
      expect(result).toEqual([mockVisit]);
    });

    it('should filter by date range', async () => {
      const from = '2026-05-01';
      const to = '2026-05-31';

      mockPrismaService.visit.findMany.mockResolvedValue([]);

      await service.findAll(mockUserId, 'SALES', from, to);

      expect(mockPrismaService.visit.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          visitorUserId: mockUserId,
          visitTime: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
        orderBy: { visitTime: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should return visit for owner (SALES)', async () => {
      mockPrismaService.visit.findUnique.mockResolvedValue(mockVisit);

      const result = await service.findOne('visit-123', mockUserId, 'SALES');

      expect(result).toEqual(mockVisit);
    });

    it('should throw ForbiddenException if SALES user tries to access other user visit', async () => {
      const otherUserVisit = { ...mockVisit, visitorUserId: 'other-user' };
      mockPrismaService.visit.findUnique.mockResolvedValue(otherUserVisit);

      await expect(
        service.findOne('visit-123', mockUserId, 'SALES'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to access any visit', async () => {
      const otherUserVisit = { ...mockVisit, visitorUserId: 'other-user' };
      mockPrismaService.visit.findUnique.mockResolvedValue(otherUserVisit);

      const result = await service.findOne(
        'visit-123',
        mockAdminUserId,
        'ADMIN',
      );

      expect(result).toEqual(otherUserVisit);
    });

    it('should throw NotFoundException if visit does not exist', async () => {
      mockPrismaService.visit.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', mockUserId, 'SALES'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a visit', async () => {
      const updateDto = { notes: 'Updated notes' };
      const updatedVisit = { ...mockVisit, ...updateDto };

      mockPrismaService.visit.findUnique.mockResolvedValue(mockVisit);
      mockPrismaService.visit.update.mockResolvedValue(updatedVisit);

      const result = await service.update(
        'visit-123',
        updateDto,
        mockUserId,
        'SALES',
      );

      expect(mockPrismaService.visit.update).toHaveBeenCalled();
      expect(result).toEqual(updatedVisit);
    });

    it('should not allow SALES user to update other user visit', async () => {
      const otherUserVisit = { ...mockVisit, visitorUserId: 'other-user' };
      mockPrismaService.visit.findUnique.mockResolvedValue(otherUserVisit);

      await expect(
        service.update('visit-123', { notes: 'test' }, mockUserId, 'SALES'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete visit for owner', async () => {
      mockPrismaService.visit.findUnique.mockResolvedValue(mockVisit);
      mockPrismaService.visit.delete.mockResolvedValue(mockVisit);

      await service.remove('visit-123', mockUserId, 'SALES');

      expect(mockPrismaService.visit.delete).toHaveBeenCalledWith({
        where: { id: 'visit-123' },
      });
    });

    it('should not allow SALES user to delete other user visit', async () => {
      const otherUserVisit = { ...mockVisit, visitorUserId: 'other-user' };
      mockPrismaService.visit.findUnique.mockResolvedValue(otherUserVisit);

      await expect(
        service.remove('visit-123', mockUserId, 'SALES'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to delete any visit', async () => {
      const otherUserVisit = { ...mockVisit, visitorUserId: 'other-user' };
      mockPrismaService.visit.findUnique.mockResolvedValue(otherUserVisit);
      mockPrismaService.visit.delete.mockResolvedValue(otherUserVisit);

      await service.remove('visit-123', mockAdminUserId, 'ADMIN');

      expect(mockPrismaService.visit.delete).toHaveBeenCalled();
    });
  });
});
