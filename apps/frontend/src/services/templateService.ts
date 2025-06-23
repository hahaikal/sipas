import api from '@/lib/api';
import { LetterTemplate } from '@sipas/types'

export interface RequiredInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number';
}

export type CreateTemplateData = Omit<LetterTemplate, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplateData = Partial<CreateTemplateData>;


export const getTemplates = async (): Promise<{ data: Pick<LetterTemplate, '_id' | 'name' | 'description'>[] }> => {
    const response = await api.get('/templates');
    return response.data;
};

export const getTemplateById = async (id: string): Promise<{ data: LetterTemplate }> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
};

export const createTemplate = async (data: CreateTemplateData): Promise<{ data: LetterTemplate }> => {
    const response = await api.post('/templates', data);
    return response.data;
};

export const updateTemplate = async (id: string, data: UpdateTemplateData): Promise<{ data: LetterTemplate }> => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
};

export const deleteTemplate = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
};