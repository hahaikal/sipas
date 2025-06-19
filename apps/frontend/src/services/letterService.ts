import api from '@/lib/api';
import { Letter } from '../../../../packages/types/src';
import { getSubdomain } from '@/lib/subdomain'; 

interface GetAllLettersResponse {
    data: Letter[];
}

export interface CreateLetterData {
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar';
  file: File;
}

export interface UpdateLetterData {
  nomorSurat?: string;
  judul?: string;
  tanggalSurat?: string;
  kategori?: string;
  tipeSurat?: 'masuk' | 'keluar';
}

export const getAllLetters = async (): Promise<GetAllLettersResponse> => {
    const subdomain = getSubdomain();
    const response = await api.post<GetAllLettersResponse>('/letters/list', { subdomain });
    return response.data;
};

export const createLetter = async (data: CreateLetterData): Promise<Letter> => {
  const subdomain = getSubdomain();
  const formData = new FormData();
  formData.append('nomorSurat', data.nomorSurat);
  formData.append('judul', data.judul);
  formData.append('tanggalSurat', data.tanggalSurat);
  formData.append('kategori', data.kategori);
  formData.append('tipeSurat', data.tipeSurat);
  formData.append('file', data.file);
  formData.append('subdomain', subdomain);

  const response = await api.post('/letters', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteLetter = async (id: string): Promise<{ message: string }> => {
    const subdomain = getSubdomain();
    const response = await api.delete(`/letters/${id}`, { data: { subdomain } });
    return response.data;
};

export const getLetterById = async (id: string): Promise<{ data: Letter }> => {
    const subdomain = getSubdomain();
    const response = await api.post<{ data: Letter }>(`/letters/${id}`, { subdomain });
    return response.data;
};

export const updateLetter = async (id: string, data: UpdateLetterData): Promise<Letter> => {
    const subdomain = getSubdomain();
    const response = await api.put<Letter>(`/letters/${id}`, { ...data, subdomain });
    return response.data;
};

export const getLetterViewUrl = async (id: string): Promise<{ url: string }> => {
    const subdomain = getSubdomain();
    const response = await api.post<{ url: string }>(`/letters/${id}/view`, { subdomain });
    return response.data;
};
