// Equb Types matching backend entities
export interface Equb {
  id: string;
  name: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  defaultContributionAmount: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED';
  currentRound: number;
  createdAt: string;
  members?: EqubMember[];
  periods?: Period[];
}

export interface CreateEqubDto {
  name: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string; // ISO date string
  defaultContributionAmount: number;
}

export interface UpdateEqubDto {
  name?: string;
  type?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate?: string;
  defaultContributionAmount?: number;
}

export interface EqubMember {
  id: string;
  contributionType: 'FULL' | 'HALF' | 'QUARTER';
  isActive: boolean;
  hasReceivedPayout: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
  equb?: Equb;
  attendances?: Attendance[];
}

export interface Attendance {
  id: string;
  status: 'PAID' | 'MISSED';
  recordedAt: string;
  periodId: string;
  period?: Period;
  equbMember?: EqubMember;
}

export interface Period {
  id: string;
  sequence: number;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  createdAt: string;
  payouts?: Payout[];
}

export interface Payout {
  id: string;
  amount: number;
  payoutDate: string;
  status: 'PENDING' | 'PAID';
  member?: EqubMember;
  equbId: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export interface EqubFilterDto {
  status?: string;
  type?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  phone: string;
  email: string;
  role?: 'admin';
}

export interface CreateAdminDto {
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: 'admin';
}
