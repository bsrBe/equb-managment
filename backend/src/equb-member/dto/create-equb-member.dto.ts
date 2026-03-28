import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateEqubMemberDto {
    @IsString()
    @IsNotEmpty()
    equbId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(['FULL', 'HALF', 'QUARTER', 'CUSTOM'])
    @IsOptional()
    contributionType?: 'FULL' | 'HALF' | 'QUARTER' | 'CUSTOM';

    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Custom amount must be greater than 0' })
    customContributionAmount?: number;
}
