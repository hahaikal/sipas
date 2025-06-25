import api from '@/lib/api';
import { Disposition } from '@sipas/types';
import { getSubdomain } from '@/lib/subdomain';

export interface CreateDispositionData {
  toUser: string;
  instructions: string;
}

/**
 * Membuat entri disposisi baru untuk sebuah surat.
 * @param letterId - ID surat yang akan didisposisikan.
 * @param data - Data disposisi (penerima dan instruksi).
 */
export const createDisposition = async (letterId: string, data: CreateDispositionData): Promise<{ message: string; data: Disposition }> => {
    const subdomain = getSubdomain();
    const payload = { ...data, subdomain };
    const response = await api.post(`/letters/${letterId}/dispositions`, payload);
    return response.data;
};

/**
 * Mengambil riwayat disposisi untuk satu surat.
 * @param letterId - ID surat yang riwayatnya ingin dilihat.
 */
export const getDispositionsForLetter = async (letterId: string): Promise<{ data: Disposition[] }> => {
    const response = await api.get(`/letters/${letterId}/dispositions`);
    return response.data;
};

export const getDispositionsForMe = async (): Promise<{ data: Disposition[] }> => {
    const response = await api.get('/dispositions/forme');
    return response.data;
};
