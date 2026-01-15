import { IsString, IsNotEmpty } from 'class-validator';
export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

import { Admin } from '../entities/admin.entity';

export class AdminResponseDto {
  accessToken: string;
  admin: Omit<Admin, 'password'>;
}
