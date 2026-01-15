export class CreateAttendanceDto {
    equbMemberId: string;
    periodId: string;
    status: 'PAID' | 'MISSED';
    recordedBy?: string;
    note?: string;
}
