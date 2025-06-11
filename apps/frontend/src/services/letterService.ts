import api from '@/lib/api';
// import { ILetterDocument } from '@/../../backend/src/models/Letter'

interface Letter {
  _id: string;
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
}

interface GetAllLettersResponse {
    data: Letter[];
}

export const getAllLetters = async (): Promise<GetAllLettersResponse> => {
    const response = await api.get<GetAllLettersResponse>('/letters');
    return response.data;
};