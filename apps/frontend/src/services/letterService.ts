import api from '@/lib/api';
import { Letter } from '../../../../packages/types/src';

interface GetAllLettersResponse {
    data: Letter[];
}

export const getAllLetters = async (): Promise<GetAllLettersResponse> => {
    const response = await api.get<GetAllLettersResponse>('/letters');
    return response.data;
};

export interface CreateLetterData {
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar';
  file: File;
}

export const createLetter = async (data: CreateLetterData): Promise<Letter> => {
  const formData = new FormData();
  formData.append('nomorSurat', data.nomorSurat);
  formData.append('judul', data.judul);
  formData.append('tanggalSurat', data.tanggalSurat);
  formData.append('kategori', data.kategori);
  formData.append('tipeSurat', data.tipeSurat);
  formData.append('file', data.file);

  const response = await api.post('/letters', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteLetter = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/letters/${id}`);
    return response.data;
};