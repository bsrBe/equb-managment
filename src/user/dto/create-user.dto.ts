import { IsString, IsNotEmpty, IsMobilePhone, IsOptional } from 'class-validator';
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMobilePhone()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    address: string;
}

export class UserResponseDto {
    @IsString()
    id: string;
    @IsString()
    name: string;
    @IsString()
    phone: string;
    @IsString()
    address?: string;
    @IsString()
    createdAt: Date;
}