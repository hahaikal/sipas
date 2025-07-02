import { Request, Response } from 'express';

export const getPlaceholders = (req: Request, res: Response) => {
    const placeholders = [
      { "value": "{{nama_guru}}", "text": "Nama guru pemohon" },
      { "value": "{{nuptk_guru}}", "text": "NUPTK guru pemohon" },
      { "value": "{{jabatan_guru}}", "text": "Jabatan guru pemohon" },
      { "value": "{{nama_kepsek}}", "text": "Nama kepala sekolah" },
      { "value": "{{nip_kepsek}}", "text": "NIP kepala sekolah" },
      { "value": "{{nomor_surat_final}}", "text": "Nomor surat (dihasilkan saat disetujui)" },
      { "value": "{{tanggal_surat_dibuat}}", "text": "Tanggal surat diajukan" },
      { "value": "{{tanggal_surat_disetujui}}", "text": "Tanggal surat disetujui" }
    ];

    res.status(200).json(placeholders);
};