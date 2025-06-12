import api from '@/lib/api';
import { User } from '@sipas/types';

interface GetAllUsersResponse {
    data: User[];
}

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
    const response = await api.get<GetAllUsersResponse>('/users');
    return response.data;
};