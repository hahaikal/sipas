export interface Letter {
  _id: string;
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar' | 'request';
  fileUrl?: string;
  createdBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  templateId?: string;
  formData?: string;
  body?: string;
  approvedBy?: string;
  approvedAt?: string;
}