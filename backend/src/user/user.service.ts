import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFilterDto } from './dto/user-filter.dto';
import { PaginationParamsDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    const saved = await this.userRepository.save(user);
    return saved;
  }

  async findAll(filter: UserFilterDto): Promise<PaginatedResponse<User>> {
    const query = this.userRepository.createQueryBuilder('user');

    if (filter.searchTerm || filter.name) {
      const name = filter.searchTerm || filter.name;
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (filter.phone) {
      query.andWhere('user.phone ILIKE :phone', { phone: `%${filter.phone}%` });
    }

    if (filter.startDate) {
      query.andWhere('user.createdAt >= :startDate', { startDate: filter.startDate });
    }

    if (filter.endDate) {
      query.andWhere('user.createdAt <= :endDate', { endDate: filter.endDate });
    }

    const [data, totalItems] = await query
      .skip(filter.skip)
      .take(filter.limit)
      .orderBy('user.createdAt', 'DESC')
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

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }
}
