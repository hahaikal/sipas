import api from '@/lib/api';
import { getSubdomain } from '@/lib/subdomain';

export const getAllNews = async () => {
    const subdomain = getSubdomain();
    const response = await api.get('/news', { params: { subdomain } });
    return response.data;
};

export const getNewsById = async (id: string) => {
    const subdomain = getSubdomain();
    const response = await api.get(`/news/${id}`, { params: { subdomain } });
    return response.data;
};

export const createNews = async (newsData: { title: string; content: string; imageUrl?: string }) => {
    const subdomain = getSubdomain();
    const response = await api.post('/news', { ...newsData, subdomain });
    return response.data;
};

export const updateNews = async (id: string, newsData: { title: string; content: string; imageUrl?: string }) => {
    const subdomain = getSubdomain();
    const response = await api.put(`/news/${id}`, { ...newsData, subdomain });
    return response.data;
};

export const deleteNews = async (id: string) => {
    const subdomain = getSubdomain();
    const response = await api.delete(`/news/${id}`, { data: { subdomain } });
    return response.data;
};
