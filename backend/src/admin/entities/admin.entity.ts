import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ default: 'active' })
    status?: 'active' | 'inactive';

    @Column({ default: 'admin' })
    role?: 'admin';

    @Column({ nullable: true })
    securityQuestion?: string;

    @Column({ nullable: true, select: false }) // Select false ensures it's not returned by default queries
    securityAnswer?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}
