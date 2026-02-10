import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Period } from './period.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { EqubMember } from '../../equb-member/entities/equb-member.entity';


@Entity()
export class Equb {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Admin)   
  @JoinColumn({ name: 'adminId' })
  admin: Admin;


  @OneToMany(() => EqubMember, em => em.equb)
  members: EqubMember[];

  @OneToMany(() => Period, (period) => period.equb)
  periods: Period[];
  
  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @Column('numeric')
  defaultContributionAmount: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'COMPLETED';

  @Column({ default: 1 })
  currentRound: number;

  @CreateDateColumn()
  createdAt: Date;
}
