import { EqubMember } from "src/equb-member/entities/equb-member.entity";
import { Entity , PrimaryGeneratedColumn , Column , CreateDateColumn , UpdateDateColumn , DeleteDateColumn , OneToMany } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({unique: true})
    phone: string;

    @Column({nullable: true})
    address: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => EqubMember, em => em.user)
    equbMemberships: EqubMember[];

}
