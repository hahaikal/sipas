import api from '@/lib/api';
import { getSubdomain } from '@/lib/subdomain';

export interface GalleryItem {
    _id: string;
    imageUrl: string;
    caption: string;
}

export const getAllGalleryItems = async (): Promise<{ data: GalleryItem[] }> => {
    const subdomain = getSubdomain();
    const response = await api.get('/gallery', { params: { subdomain } });
    return response.data;
};

export const createGalleryItem = async (data: { caption: string; image: File }): Promise<GalleryItem> => {
    const subdomain = getSubdomain();
    const formData = new FormData();
    formData.append('caption', data.caption);
    formData.append('image', data.image);
    formData.append('subdomain', subdomain);

    const response = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteGalleryItem = async (id: string): Promise<{ message: string }> => {
    const subdomain = getSubdomain();
    const response = await api.delete(`/gallery/${id}`, { data: { subdomain } });
    return response.data;
};

export const getPublicGalleryItems = async (subdomain: string): Promise<{ data: GalleryItem[] }> => {
    const response = await api.get('/public/gallery', {
        params: { subdomain }
    });
    return response.data;
};