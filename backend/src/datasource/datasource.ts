import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Admin } from '../admin/entities/admin.entity';
import { User } from '../user/entities/user.entity';
import { Equb } from '../equb/entities/equb.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { EqubMember } from '../equb-member/entities/equb-member.entity';
import { Payout } from '../payout/entities/payout.entity';
import { Period } from '../equb/entities/period.entity';

dotenv.config();

function buildDataSourceOptions(): DataSourceOptions {

  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [Admin, User, Equb, Attendance, EqubMember, Payout, Period],
      synchronize: true,
    };
  }

  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [Admin, User, Equb, Attendance, EqubMember, Payout, Period],
    synchronize: true,
  };
}

export const dataSourceOptions = buildDataSourceOptions();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;