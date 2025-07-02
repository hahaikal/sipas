import api from '@/lib/api';
import { User } from '@sipas/types';
import { getSubdomain } from '@/lib/subdomain';

interface GetAllUsersResponse {
    data: User[];
}

export interface CreateUserData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'guru' | 'admin' | 'kepala sekolah';
    jabatan?: string;
    nuptk?: string;
    golongan?: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'guru' | 'admin' | 'kepala sekolah';
    jabatan?: string;
    nuptk?: string;
    golongan?: string;
}

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
    const subdomain = getSubdomain();
    const response = await api.get<GetAllUsersResponse>('/users', { params: { subdomain } });
    return response.data;
};

export const createUser = async (data: CreateUserData): Promise<{ data: User }> => {
    const subdomain = getSubdomain();
    const response = await api.post('/users', { ...data, subdomain });
    return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<{ data: User }> => {
    const subdomain = getSubdomain();
    const response = await api.put(`/users/${id}`, { ...data, subdomain });
    return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
    const subdomain = getSubdomain();
    const response = await api.delete(`/users/${id}`, { data: { subdomain } });
    return response.data;
};