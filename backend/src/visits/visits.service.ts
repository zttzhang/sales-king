import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVisitDto, userId: string) {
    return this.prisma.visit.create({
      data: {
        storeId: dto.storeId,
        visitorUserId: userId,
        visitTime: dto.visitTime ? new Date(dto.visitTime) : new Date(),
        result: dto.result,
        notes: dto.notes,
      },
    });
  }

  findAll(
    userId: string,
    userRole: string,
    from?: string,
    to?: string,
    storeId?: string,
  ) {
    const where: Prisma.VisitWhereInput = {};
    if (userRole === 'SALES') {
      where.visitorUserId = userId;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (from || to) {
      where.visitTime = {};
      if (from) {
        where.visitTime.gte = new Date(from);
      }
      if (to) {
        where.visitTime.lte = new Date(to);
      }
    }
    return this.prisma.visit.findMany({
      where,
      orderBy: { visitTime: 'desc' },
      include: { store: true, visitor: true },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { store: true, visitor: true },
    });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    if (userRole === 'SALES' && visit.visitorUserId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return visit;
  }

  async update(
    id: string,
    dto: UpdateVisitDto,
    userId: string,
    userRole: string,
  ) {
    await this.findOne(id, userId, userRole);
    const data: Prisma.VisitUpdateInput = {};
    if (dto.storeId) {
      data.store = { connect: { id: dto.storeId } };
    }
    if (dto.visitTime) data.visitTime = new Date(dto.visitTime);
    if (dto.result) data.result = dto.result;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return this.prisma.visit.update({ where: { id }, data });
  }

  async remove(id: string, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole);
    return this.prisma.visit.delete({ where: { id } });
  }
}
