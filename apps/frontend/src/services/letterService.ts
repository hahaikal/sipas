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
  tipeSurat?: 'masuk' | 'keluar' | 'generated';
}

export interface GenerateLetterPayload {
  templateId: string;
  formData: Record<string, unknown>;
}


export const getAllLetters = async (params?: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }): Promise<GetAllLettersResponse> => {
    const subdomain = getSubdomain();
    const payload = { subdomain, ...params };
    const response = await api.post<GetAllLettersResponse>('/letters/list', payload);
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

export const approveLetter = async (id: string): Promise<{ message: string; data: Letter }> => {
    const response = await api.patch(`/letters/${id}/approve`);
    return response.data;
}

export const rejectLetter = async (id: string): Promise<{ message: string; data: Letter }> => {
    const response = await api.patch(`/letters/${id}/reject`);
    return response.data;
}

export const getLatestLetters = async (limit: number): Promise<Letter[]> => {
    const subdomain = getSubdomain();
    const response = await api.post<{ data: Letter[] }>('/letters/list', { subdomain });
    const letters = response.data.data;
    letters.sort((a, b) => new Date(b.tanggalSurat).getTime() - new Date(a.tanggalSurat).getTime());
    return letters.slice(0, limit);
};

export const generateLetterFromTemplate = async (payload: GenerateLetterPayload): Promise<{ message: string; data: Letter }> => {
    const response = await api.post('/letters/generate-request', payload);
    return response.data;
};

export const getLetterPreview = async (id: string): Promise<{ content: string }> => {
    const response = await api.get(`/letters/${id}/preview`);
    return response.data;
};


