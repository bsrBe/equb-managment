import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateEqubMemberDto {
    @IsString()
    @IsNotEmpty()
    equbId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(['FULL', 'HALF', 'QUARTER'])
    @IsOptional()
    contributionType?: 'FULL' | 'HALF' | 'QUARTER';
}
