import { Entity , PrimaryGeneratedColumn , Column , CreateDateColumn , UpdateDateColumn , DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Equb } from "src/equb/entities/equb.entity";
import { EqubMember } from "src/equb-member/entities/equb-member.entity";

@Entity()
export class Payout {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Equb, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'equbId' })
    equb: Equb;

    @Column()
    equbId: string;

    @ManyToOne(() => EqubMember, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memberId' })
    member: EqubMember;

    @Column()
    memberId: string;

    @Column()
    amount: number;

    @Column()
    periodKey: string;

    @Column()
    payoutDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
