export type UserRole = 'admin' | 'guru' | 'kepala sekolah';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Letter {
  _id: string;
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar';
  fileUrl: string;
  createdBy: string;
}
