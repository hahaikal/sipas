import api from '@/lib/api';

export const getAllNews = async () => {
    const response = await api.get('/news');
    return response.data;
};

export const getNewsById = async (id: string) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
};

export const createNews = async (newsData: { title: string; content: string; imageUrl?: string }) => {
    const response = await api.post('/news', newsData);
    return response.data;
};

export const updateNews = async (id: string, newsData: { title: string; content: string; imageUrl?: string }) => {
    const response = await api.put(`/news/${id}`, newsData);
    return response.data;
};

export const deleteNews = async (id: string) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
};