import axios from 'axios';
import { ApiResponse, LoginFormData, LoginResponseData, RegisterFormData } from '../types/auth.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const authService = {
  async login(data: LoginFormData): Promise<ApiResponse<LoginResponseData>> {
    const response = await authApi.post<ApiResponse<LoginResponseData>>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<ApiResponse<LoginResponseData>> {
    const response = await authApi.post<ApiResponse<LoginResponseData>>('/auth/register', data);
    return response.data;
  },

  async logout(accessToken: string): Promise<ApiResponse> {
    const response = await authApi.post<ApiResponse>(
      '/auth/logout',
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  },

  async getProfile(accessToken: string): Promise<ApiResponse> {
    const response = await authApi.get<ApiResponse>('/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};
