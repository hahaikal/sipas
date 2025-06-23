export type UserRole = 'admin' | 'guru' | 'kepala sekolah';
export * from './template';
export * from './news';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Letter {
  _id: string;
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar' | 'generated'; 
  fileUrl: string;
  createdBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
}
