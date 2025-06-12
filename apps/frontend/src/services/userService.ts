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

export interface UpdateUserData {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'guru' | 'admin' | 'kepala sekolah';
}

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
    const response = await api.get<GetAllUsersResponse>('/users');
    return response.data;
};

export const createUser = async (data: CreateUserData): Promise<{ data: User }> => {
    const response = await api.post('/users', data);
    return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<{ data: User }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};