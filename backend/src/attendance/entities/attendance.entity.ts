import { Entity , PrimaryGeneratedColumn , Column , CreateDateColumn , UpdateDateColumn , ManyToOne , JoinColumn , Unique} from "typeorm";
import { EqubMember } from "../../equb-member/entities/equb-member.entity";
import { Admin } from "../../admin/entities/admin.entity";
import { Period } from "../../equb/entities/period.entity";

@Entity('attendances')
@Unique(['equbMember', 'period'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EqubMember, em => em.attendances, { onDelete: 'CASCADE' })
  equbMember: EqubMember;

  @ManyToOne(() => Period, (period) => period.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'periodId' })
  period: Period;

  @Column()
  periodId: string;
  // daily: 2026-01-10
  // weekly: 2026-W02
  // monthly: 2026-01

  @Column({
    type: 'enum',
    enum: ['PAID', 'MISSED'],
    default: 'MISSED',
  })
  status: 'PAID' | 'MISSED';

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'recordedBy' })
  recordedBy: Admin;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  recordedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
