import { EqubMember } from 'src/equb-member/entities/equb-member.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn , OneToMany } from 'typeorm';


@Entity()
export class Equb {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Admin)   
  @JoinColumn({ name: 'adminId' })
  admin: Admin;


  @OneToMany(() => EqubMember, em => em.equb)
  members: EqubMember[];
  
  @Column()
  adminId: string;

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

  @CreateDateColumn()
  createdAt: Date;
}
