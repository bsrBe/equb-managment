import axios from 'axios';
import {
    Equb,
    CreateEqubDto,
    UpdateEqubDto,
    EqubFilterDto,
    EqubMember,
    Attendance,
    User,
    Payout,
    Admin,
    CreateAdminDto
} from '../types/equb.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://equb-managment.onrender.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Equb API endpoints
export const equbApi = {
  /**
   * Get all equbs for the authenticated admin
   * @param filter Optional filter parameters
   */
  getAll: async (filter?: EqubFilterDto) => {
    const response = await apiClient.get<{ data: Equb[], meta: { total: number; page: number; limit: number } }>('/equb', { params: filter });
    return response.data.data;
  },

  /**
   * Get a single equb by ID
   * @param id Equb UUID
   */
  getOne: async (id: string) => {
    const response = await apiClient.get<Equb>(`/equb/${id}`);
    return response.data;
  },

  /**
   * Create a new equb (admin is automatically associated via JWT)
   * @param data Equb creation data
   */
  create: async (data: CreateEqubDto) => {
    const response = await apiClient.post<Equb>('/equb', data);
    return response.data;
  },

  /**
   * Update an existing equb
   * @param id Equb UUID
   * @param data Partial equb data to update
   */
  update: async (id: string, data: UpdateEqubDto) => {
    const response = await apiClient.patch<Equb>(`/equb/${id}`, data);
    return response.data;
  },

  /**
   * Delete an equb
   * @param id Equb UUID
   */
  delete: async (id: string) => {
    await apiClient.delete(`/equb/${id}`);
  },

  /**
   * Assign a manual winner for a specific round
   * @param data Payout data { equbId, memberId, periodId }
   */
  assignWinner: async (data: { equbId: string; memberId: string; periodId: string }) => {
    const response = await apiClient.post('/payout/record-manual-winner', data);
    return response.data;
  },

  createEqubMember: async (data: { equbId: string; userId: string; contributionType: 'FULL' | 'HALF' | 'QUARTER' }) => {
    const response = await apiClient.post('/equb-member', data);
    return response.data;
  },

  registerUser: async (userData: { name: string; phone: string }) => {
    const response = await apiClient.post<User>('/user', userData);
    return response.data;
  },

  createAdmin: async (adminData: CreateAdminDto) => {
    const response = await apiClient.post<Admin>('/admin', adminData);
    return response.data;
  },

  /**
   * Attendance APIs
   */
  createAttendance: async (data: { equbMemberId: string; periodId: string; status: 'PAID' | 'MISSED' }) => {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  getAttendance: async (equbId: string, round?: number, limit?: number): Promise<Attendance[]> => {
    const response = await apiClient.get<{ data: Attendance[] }>('/attendance', {
      params: { equbId, round, limit }
    });
    return response.data.data;
  },

  getPayouts: async (equbId: string, limit?: number): Promise<Payout[]> => {
    const response = await apiClient.get<{ data: Payout[] }>('/payout', {
      params: { equbId, limit }
    });
    return response.data.data;
  },

  getUserMemberships: async (userId: string) => {
    const response = await apiClient.get<EqubMember[]>(`/user/${userId}/memberships`, { 
      params: { limit: 1000 } 
    });
    return response.data;
  },

  getUsers: async (searchTerm?: string) => {
    const response = await apiClient.get<{ data: User[] }>('/user', {
      params: { searchTerm, limit: 1000 }
    });
    return response.data.data;
  },

  /**
   * Admin Profile APIs
   */
  getProfile: async () => {
    const response = await apiClient.get<Admin>('/auth/profile');
    return response.data;
  },

  updateProfile: async (id: string, data: Partial<Admin>) => {
    const response = await apiClient.patch<Admin>(`/auth/${id}`, data);
    return response.data;
  },

  /**
   * Security Question APIs
   */
  setSecurityQuestion: async (data: { password: string; question: string; answer: string }) => {
    const response = await apiClient.post('/auth/security-question', data);
    return response.data;
  },

  getSecurityQuestion: async (phone: string) => {
    const response = await apiClient.get<{ question: string; id: string }>(`/auth/security-question/${phone}`);
    return response.data;
  },

  resetPassword: async (data: { phone: string; answer: string; newPassword: string }) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};

export default apiClient;
