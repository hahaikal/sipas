import api from '@/lib/api';
import { User } from '@sipas/types';

interface GetAllUsersResponse {
    data: User[];
}

export interface CreateUserData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'guru' | 'admin' | 'kepala sekolah';
}

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
    const response = await api.get<GetAllUsersResponse>('/users');
    return response.data;
};

export const createUser = async (data: CreateUserData): Promise<{ data: User }> => {
    const response = await api.post('/users', data);
    return response.data;
};