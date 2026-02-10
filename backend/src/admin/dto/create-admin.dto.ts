import {IsString, IsNotEmpty, IsEmail, IsMobilePhone, IsStrongPassword , IsOptional} from 'class-validator'
export class CreateAdminDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    status?: 'active' | 'inactive';

    @IsString()
    @IsOptional()
    role?: 'admin';
}
