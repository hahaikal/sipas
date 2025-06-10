import api from '@/lib/api';
import { User } from '@sipas/types';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const register = async (data: RegisterData): Promise<{ message: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const verifyOtp = async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
};