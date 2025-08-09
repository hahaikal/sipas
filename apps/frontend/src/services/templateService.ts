import api from '@/lib/api';
import { LetterTemplate, Placeholder, RequiredInput } from '@sipas/types';

export const getAllTemplates = async (): Promise<{ data: LetterTemplate[] }> => {
    const response = await api.get('/templates');
    return response.data;
};

export const getTemplateById = async (id: string): Promise<{ data: LetterTemplate }> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
};

// Fungsi baru untuk mengambil data persiapan template
export const prepareTemplate = async (id: string): Promise<{ data: Pick<LetterTemplate, 'name' | 'description' | 'requiredInputs'> }> => {
    const response = await api.get(`/templates/${id}/prepare`);
    return response.data;
};

export const createTemplate = async (data: Partial<LetterTemplate>): Promise<{ data: LetterTemplate }> => {
    const response = await api.post('/templates', data);
    return response.data;
};

export const updateTemplate = async (id: string, data: Partial<LetterTemplate>): Promise<{ data: LetterTemplate }> => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
};

export const deleteTemplate = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
};

export const getPlaceholders = async (): Promise<Placeholder[]> => {
    const response = await api.get('/placeholders');
    return response.data;
};

export type { LetterTemplate, Placeholder, RequiredInput };
