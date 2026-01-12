import {Entity , PrimaryGeneratedColumn , Column} from "typeorm";

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

    @Column({default: 'active'})
    status: 'active' | 'inactive';
    
    @Column({default: 'admin'})
    role: 'admin' | 'super-admin';
}
