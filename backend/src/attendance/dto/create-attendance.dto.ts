import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
    @IsString()
    @IsNotEmpty()
    equbMemberId: string;

    @IsString()
    @IsNotEmpty()
    periodId: string;

    @IsEnum(['PAID', 'MISSED'])
    status: 'PAID' | 'MISSED';

    @IsString()
    @IsOptional()
    recordedBy?: string;

    @IsString()
    @IsOptional()
    note?: string;
}
