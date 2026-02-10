import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto, AdminResponseDto } from 'src/admin/dto/AdminLogin.dto';
import { AdminService } from 'src/admin/admin.service';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { UpdateAdminDto } from 'src/admin/dto/update-admin.dto';
import { plainToInstance } from 'class-transformer';
UnauthorizedException
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService : JwtService,
    private readonly adminService : AdminService

  ){}
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(String(id), updateAdminDto);
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  async registerAdmin(createAdminDto : CreateAdminDto){
    return this.adminService.create(createAdminDto);
  } 

  async login(adminLoginDto :AdminLoginDto){
    const {phone , password} = adminLoginDto;

    const admin = await this.adminService.findByPhone(phone)

    if(!admin){
      throw new NotFoundException("User not Found")
    }

    const isPasswordMatch = await bcrypt.compare(password,admin.password)

    if(!isPasswordMatch){
      throw new UnauthorizedException("Invalid Credentials")
    }
    const payload = {
      sub: admin.id,
      role: admin.role,
    };
    const accessToken = this.jwtService.sign(payload)
    const { password:_, ...adminWithoutPassword } = admin;
    return {
      accessToken,
      admin: adminWithoutPassword
    }
  } 
  async setSecurityQuestion(userId: string, dto: { password: string, question: string, answer: string }) {
    const admin = await this.adminService.findOne(userId);
    
    // Verify current password
    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Hash answer
    const answerHash = await bcrypt.hash(dto.answer.toLowerCase().trim(), 10);
    
    await this.adminService.updateSecurity(userId, dto.question, answerHash);
    return { message: 'Security question set successfully' };
  }

  async getSecurityQuestion(phone: string) {
    const admin = await this.adminService.findByPhone(phone);
    if (!admin.securityQuestion) {
      throw new NotFoundException('No security question set for this account');
    }
    return { question: admin.securityQuestion, id: admin.id };
  }

  async resetPassword(dto: { phone: string, answer: string, newPassword: string }) {
    const admin = await this.adminService.findWithSecurity(dto.phone);
    
    if (!admin.securityAnswer) {
      throw new UnauthorizedException('Security recovery not set up');
    }

    const isMatch = await bcrypt.compare(dto.answer.toLowerCase().trim(), admin.securityAnswer);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect security answer');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.adminService.updatePassword(admin.id, hashedPassword);
    
    return { message: 'Password reset successfully' };
  }
}
