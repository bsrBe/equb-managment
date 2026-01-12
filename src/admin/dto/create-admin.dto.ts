import {IsString, IsNotEmpty, IsEmail, IsMobilePhone, IsStrongPassword , IsOptional} from 'class-validator'
export class CreateAdminDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMobilePhone()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    status: 'active' | 'inactive';

    @IsString()
    @IsOptional()
    role: 'admin' | 'super-admin';
}
