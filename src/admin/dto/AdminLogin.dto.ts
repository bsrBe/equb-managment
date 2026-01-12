import { IsString, IsNotEmpty } from 'class-validator';
export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AdminResponseDto {
  id: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
}
