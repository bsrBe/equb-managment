import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from 'dotenv';
import { Admin } from "../admin/entities/admin.entity";
import { User } from "../user/entities/user.entity";
import { Equb } from "src/equb/entities/equb.entity";
import { Attendance } from "src/attendance/entities/attendance.entity";
import { EqubMember } from "src/equb-member/entities/equb-member.entity";
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [Admin , User , Equb , Attendance , EqubMember],
    synchronize: true, 
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
