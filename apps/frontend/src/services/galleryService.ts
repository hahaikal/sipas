import api from '@/lib/api';

export interface GalleryItem {
    _id: string;
    imageUrl: string;
    caption: string;
}

export const getAllGalleryItems = async (): Promise<{ data: GalleryItem[] }> => {
    const response = await api.get('/gallery');
    return response.data;
};

export const createGalleryItem = async (data: { caption: string; image: File }): Promise<GalleryItem> => {
    const formData = new FormData();
    formData.append('caption', data.caption);
    formData.append('image', data.image);

    const response = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteGalleryItem = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
};