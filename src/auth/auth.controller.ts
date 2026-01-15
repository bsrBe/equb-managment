import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AdminLoginDto, AdminResponseDto } from 'src/admin/dto/AdminLogin.dto';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { currentAdmin } from './decorators/current-admin.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/adminRegister')
  register(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.registerAdmin(createAdminDto);
  }

  @Post('/adminLogin')
  login(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.login(adminLoginDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  getProfile(@currentAdmin() admin: AdminResponseDto) {
    return admin;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

}
