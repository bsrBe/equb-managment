import apiClient from './equbApi';

export interface DashboardStats {
  totalExpected: number;
  totalCollected: number;
  activeEqubs: number;
  totalMembers: number;
  upcomingPayouts?: number;
  overduePayments?: number;
}

export interface EqubStats {
  totalContributions: number;
  totalPayouts: number;
  completionPercentage: number;
  averageAttendance: number;
  totalMembers: number;
  activePeriods: number;
}

export interface MemberStats {
  totalContributions: number;
  missedPayments: number;
  attendanceRate: number;
  totalEqubs: number;
  hasReceivedPayout: boolean;
}

export const reportingApi = {
  /**
   * Get dashboard statistics for the authenticated admin
   */
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/reporting/dashboard');
    return response.data;
  },

  /**
   * Get statistics for a specific equb
   * @param equbId Equb UUID
   */
  getEqubStats: async (equbId: string): Promise<EqubStats> => {
    const response = await apiClient.get<EqubStats>(`/reporting/equb/${equbId}`);
    return response.data;
  },

  /**
   * Get statistics for a specific member
   * @param memberId Member UUID
   */
  getMemberStats: async (memberId: string): Promise<MemberStats> => {
    const response = await apiClient.get<MemberStats>(`/reporting/member/${memberId}`);
    return response.data;
  },

  /**
   * Get all financial transactions (collections and payouts)
   */
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>('/reporting/transactions');
    return response.data;
  },
};

export interface Transaction {
  id: string;
  type: 'COLLECTION' | 'PAYOUT';
  amount: number;
  date: string;
  equbName: string;
  memberName: string;
  paymentMethod: string;
  status: 'COMPLETED' | 'PENDING';
}
