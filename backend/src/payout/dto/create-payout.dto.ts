import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePayoutDto {
    @IsUUID()
    @IsNotEmpty()
    equbId: string;

    @IsUUID()
    @IsNotEmpty()
    periodId: string;
}
