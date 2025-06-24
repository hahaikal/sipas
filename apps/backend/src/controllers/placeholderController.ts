import { Request, Response } from 'express';

export const getPlaceholders = (req: Request, res: Response) => {
    const placeholders = [
      { "key": "{{nama_guru}}", "description": "Nama guru pemohon" },
      { "key": "{{nuptk_guru}}", "description": "NUPTK guru pemohon" },
      { "key": "{{jabatan_guru}}", "description": "Jabatan guru pemohon" },
      { "key": "{{nama_kepsek}}", "description": "Nama kepala sekolah" },
      { "key": "{{nip_kepsek}}", "description": "NIP kepala sekolah" },
      { "key": "{{nomor_surat_final}}", "description": "Nomor surat (dihasilkan saat disetujui)" },
      { "key": "{{tanggal_surat_dibuat}}", "description": "Tanggal surat diajukan" },
      { "key": "{{tanggal_surat_disetujui}}", "description": "Tanggal surat disetujui" }
    ];

    res.status(200).json(placeholders);
};