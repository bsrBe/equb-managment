import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}
  async create(createAdminDto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
      
    });
    return this.adminRepository.save(admin);
  }

  async findByPhone(phone: string){
    const user =  await this.adminRepository.findOneBy({phone})
    if (!user){
      throw new NotFoundException("Admin with this phone is not found")
    }
    return user
  }

  findAll() {
    return this.adminRepository.find();
  }

  async findOne(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const { password, oldPassword, ...otherData } = updateAdminDto;
    const admin = await this.findOne(id);

    const updateData: any = { ...otherData };

    if (password) {
      if (!oldPassword) {
        throw new UnauthorizedException('Current password is required to set a new password');
      }

      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        throw new UnauthorizedException('Current password does not match');
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    await this.adminRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const admin = await this.findOne(id);
    return this.adminRepository.remove(admin);
  }

  async updateSecurity(id: string, question: string, answerHash: string) {
    await this.adminRepository.update(id, {
      securityQuestion: question,
      securityAnswer: answerHash,
    });
  }

  async findWithSecurity(phone: string) {
    const admin = await this.adminRepository.createQueryBuilder('admin')
      .where('admin.phone = :phone', { phone })
      .addSelect('admin.securityAnswer')
      .getOne();
    
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async updatePassword(id: string, passwordHash: string) {
    await this.adminRepository.update(id, { password: passwordHash });
  }
}
