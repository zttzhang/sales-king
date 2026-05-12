import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(keyword?: string, regionId?: string, page = 1, pageSize = 20) {
    const where: Prisma.StoreWhereInput = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { address: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (regionId) {
      where.regionId = regionId;
    }

    const skip = (page - 1) * pageSize;

    return this.prisma.store.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { region: true },
      skip,
      take: pageSize,
    });
  }

  async findAllWithCount(keyword?: string, regionId?: string, page = 1, pageSize = 20) {
    const where: Prisma.StoreWhereInput = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { address: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (regionId) {
      where.regionId = regionId;
    }

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { region: true },
        skip,
        take: pageSize,
      }),
      this.prisma.store.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { region: true },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  create(dto: CreateStoreDto) {
    return this.prisma.store.create({ data: dto });
  }

  async update(id: string, dto: UpdateStoreDto) {
    await this.findOne(id);
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.store.delete({ where: { id } });
  }
}
