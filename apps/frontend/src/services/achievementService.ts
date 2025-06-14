import api from '@/lib/api';

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
    const response = await api.get('/achievements');
    return response.data;
};

export const createAchievement = async (data: AchievementData): Promise<any> => {
    const response = await api.post('/achievements', data);
    return response.data;
};

export const deleteAchievement = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/achievements/${id}`);
    return response.data;
};