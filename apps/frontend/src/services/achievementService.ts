import api from '@/lib/api';
import { getSubdomain } from '@/lib/subdomain';

export interface AchievementData {
    title: string;
    description: string;
    year: number;
    level: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
    achievedBy: string;
}

export interface Achievement extends AchievementData {
    _id: string;
}

export const getAllAchievements = async (): Promise<{ data: Achievement[] }> => {
    const subdomain = getSubdomain();
    const response = await api.get('/achievements', { params: { subdomain } });
    return response.data;
};

export const createAchievement = async (data: AchievementData): Promise<{ data: Achievement }> => {
    const subdomain = getSubdomain();
    const response = await api.post('/achievements', { ...data, subdomain });
    return response.data;
};

export const deleteAchievement = async (id: string): Promise<{ message: string }> => {
    const subdomain = getSubdomain();
    const response = await api.delete(`/achievements/${id}`, { data: { subdomain } });
    return response.data;
};
