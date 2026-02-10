import { Attendance } from "src/attendance/entities/attendance.entity";
import { Equb } from "src/equb/entities/equb.entity";
import { User } from "src/user/entities/user.entity";
import { Entity , PrimaryGeneratedColumn , Column , CreateDateColumn , UpdateDateColumn , DeleteDateColumn , ManyToOne , JoinColumn , OneToMany , Unique } from "typeorm";

@Entity()
@Unique(['equb', 'user'])
export class EqubMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Equb, equb => equb.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'equbId' })
    equb: Equb;

    @ManyToOne(() => User, user => user.equbMemberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;


  @Column({
    type: 'enum',
    enum: ['FULL', 'HALF', 'QUARTER'],
    default: 'FULL',
  })
  contributionType: 'FULL' | 'HALF' | 'QUARTER';
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
