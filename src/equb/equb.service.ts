import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEqubDto } from './dto/create-equb.dto';
import { UpdateEqubDto } from './dto/update-equb.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equb } from './entities/equb.entity';
import { Repository, ILike, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { EqubFilterDto } from './dto/equb-filter.dto';
import { AdminResponseDto } from 'src/admin/dto/AdminLogin.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class EqubService {
  constructor(
    @InjectRepository(Equb)
    private readonly equbRepo: Repository<Equb>,
  ) {}

  async create(createEqubDto: CreateEqubDto, adminId: string) {
    const equb = this.equbRepo.create({
      ...createEqubDto,
      admin: { id: adminId },
    });
    const saved = await this.equbRepo.save(equb);
    return this.findOne(saved.id, adminId);
  }

  async findAll(adminId: string, filter: EqubFilterDto): Promise<PaginatedResponse<Equb>> {
    const query = this.equbRepo.createQueryBuilder('equb')
      .where('equb.adminId = :adminId', { adminId });

    if (filter.searchTerm || filter.name) {
      const name = filter.searchTerm || filter.name;
      query.andWhere('equb.name ILIKE :name', { name: `%${name}%` });
    }

    if (filter.type) {
      query.andWhere('equb.type = :type', { type: filter.type });
    }

    if (filter.status) {
      query.andWhere('equb.status = :status', { status: filter.status });
    }

    if (filter.minContribution) {
      query.andWhere('equb.defaultContributionAmount >= :min', { min: filter.minContribution });
    }

    if (filter.maxContribution) {
      query.andWhere('equb.defaultContributionAmount <= :max', { max: filter.maxContribution });
    }

    const [data, totalItems] = await query
      .skip(filter.skip)
      .take(filter.limit)
      .orderBy('equb.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / filter.limit);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: filter.limit,
        totalPages,
        currentPage: filter.page,
      },
    };
  }

  async findOne(id: string, adminId: string) {
    const equb = await this.equbRepo.findOne({
      where: { id, admin: { id: adminId } },
      relations: ['members'],
    });
    if (!equb) throw new NotFoundException('Equb not found');
    return equb;
  }

  async update(id: string, updateEqubDto: UpdateEqubDto, adminId: string) {
    const equb = await this.findOne(id, adminId);
    Object.assign(equb, updateEqubDto);
    await this.equbRepo.save(equb);
    return this.findOne(id, adminId);
  }

  async remove(id: string, adminId: string) {
    const equb = await this.findOne(id, adminId);
    return await this.equbRepo.remove(equb);
  }
}
