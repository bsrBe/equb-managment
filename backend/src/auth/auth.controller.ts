import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdateAdminDto } from 'src/admin/dto/update-admin.dto';
import { AdminLoginDto, AdminResponseDto } from 'src/admin/dto/AdminLogin.dto';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { currentAdmin } from './decorators/current-admin.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SetSecurityQuestionDto, ResetPasswordDto } from './dto/security-question.dto';

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
  getProfile(@currentAdmin() admin: any) {
    return admin;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/security-question')
  setSecurityQuestion(@currentAdmin() admin: any, @Body() dto: SetSecurityQuestionDto) {
    return this.authService.setSecurityQuestion(admin.id, dto);
  }

  @Get('/security-question/:phone')
  getSecurityQuestion(@Param('phone') phone: string) {
    return this.authService.getSecurityQuestion(phone);
  }

  @Post('/reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.authService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

}
