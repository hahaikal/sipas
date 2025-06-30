import { Router } from 'express';
import * as schoolController from '../controllers/schoolController';
import { uploadImage } from '../middleware/uploadMiddleware';
import { protect, admin } from '../middleware/authMiddleware';

const placeholderList = [
    { value: '{{nama_surat}}', text: 'Nama Surat' },
    { value: '{{tanggal_surat}}', text: 'Tanggal Surat' },
    { value: '{{nomor_surat}}', text: 'Nomor Surat' },
    { value: '{{nama_guru}}', text: 'Nama Guru' },
    { value: '{{nama_siswa}}', text: 'Nama Siswa' },
    { value: '{{kelas_siswa}}', text: 'Kelas Siswa' },
    { value: '{{nama_kepala_sekolah}}', text: 'Nama Kepala Sekolah' },
];

const router = Router();

router.post('/upload-logo', protect, admin, uploadImage.single('logo'), schoolController.uploadLogo);
router.put('/settings', protect, admin, schoolController.updateSchoolSettings);

router.get('/settings', protect, admin, schoolController.getSchoolSettings);

router.get('/placeholders', protect, (req, res) => {
    res.status(200).json(placeholderList);
});

export default router;