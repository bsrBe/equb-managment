import { Attendance } from "../../attendance/entities/attendance.entity";
import { Equb } from "../../equb/entities/equb.entity";
import { User } from "../../user/entities/user.entity";
import { Entity , PrimaryGeneratedColumn , Column , CreateDateColumn , UpdateDateColumn , DeleteDateColumn , ManyToOne , JoinColumn , OneToMany , Unique } from "typeorm";

@Entity()
@Unique(['equb', 'user'])
export class EqubMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Equb, equb => equb.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'equbId' })
    equb: Equb;

    @Column({ nullable: true })
    equbId: string;

    @ManyToOne(() => User, user => user.equbMemberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;


  @Column({
    type: 'enum',
    enum: ['FULL', 'HALF', 'QUARTER', 'CUSTOM'],
    default: 'FULL',
  })
  contributionType: 'FULL' | 'HALF' | 'QUARTER' | 'CUSTOM';

  @Column({ type: 'numeric', nullable: true })
  customContributionAmount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  hasReceivedPayout: boolean;

  @OneToMany(() => Attendance, att => att.equbMember)
  attendances: Attendance[];


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
