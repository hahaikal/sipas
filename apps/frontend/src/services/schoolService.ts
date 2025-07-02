import api from '@/lib/api';
import { School } from '@sipas/types';

export const getSchoolSettings = async (): Promise<{ data: School }> => {
    const response = await api.get('/schools/settings');
    return response.data;
};

export const updateSchoolSettings = async (data: Partial<School>): Promise<{ data: School }> => {
    const response = await api.put('/schools/settings', data);
    return response.data;
};

export const uploadLogo = async (file: File): Promise<{ message: string; url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/schools/upload-logo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export type { School };