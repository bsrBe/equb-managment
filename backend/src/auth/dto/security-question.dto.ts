import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SetSecurityQuestionDto {
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    question: string;

    @IsNotEmpty()
    @IsString()
    answer: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    answer: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}
