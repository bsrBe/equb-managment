import { Entity , PrimaryGeneratedColumn , Column , CreateDateColumn , UpdateDateColumn , DeleteDateColumn , ManyToOne , JoinColumn , Unique} from "typeorm";
import { EqubMember } from "src/equb-member/entities/equb-member.entity";
import { Admin } from "src/admin/entities/admin.entity";
@Entity('attendances')
@Unique(['equbMember', 'periodKey'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EqubMember, em => em.attendances, { onDelete: 'CASCADE' })
  equbMember: EqubMember;

  @Column()
  periodKey: string;
  // daily: 2026-01-10
  // weekly: 2026-W02
  // monthly: 2026-01

  @Column({
    type: 'enum',
    enum: ['PAID', 'MISSED'],
    default: 'MISSED',
  })
  status: 'PAID' | 'MISSED';

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'recordedBy' })
  recordedBy: Admin;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  recordedAt: Date;
}
