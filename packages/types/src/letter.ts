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