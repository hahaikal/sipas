import api from '@/lib/api';
import { Placeholder } from '@sipas/types/placeholder';

export const getPlaceholders = async (): Promise<Placeholder[]> => {
    const response = await api.get('/placeholders');
    return response.data;
};