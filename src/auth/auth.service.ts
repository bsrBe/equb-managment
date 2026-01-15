import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto, AdminResponseDto } from 'src/admin/dto/AdminLogin.dto';
import { AdminService } from 'src/admin/admin.service';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
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

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
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
}
