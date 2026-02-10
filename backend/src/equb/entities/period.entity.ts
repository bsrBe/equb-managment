import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Equb } from './equb.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Payout } from '../../payout/entities/payout.entity';

@Entity('periods')
export class Period {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Equb, (equb) => equb.periods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equbId' })
  equb: Equb;

  @Column()
  equbId: string;

  @Column()
  sequence: number; // 1, 2, 3...

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @OneToMany(() => Attendance, (attendance) => attendance.period)
  attendances: Attendance[];

  @OneToMany(() => Payout, (payout) => payout.period)
  payouts: Payout[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
