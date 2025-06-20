'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLetter, CreateLetterData } from '@/services/letterService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UploadPage() {
  const [formData, setFormData] = useState({
    nomorSurat: '',
    judul: '',
    tanggalSurat: '',
    kategori: '',
    tipeSurat: 'masuk' as 'masuk' | 'keluar',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('File PDF harus dipilih.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dataToSubmit: CreateLetterData = { ...formData, file };
      await createLetter(dataToSubmit);
      setSuccess('Surat berhasil diarsipkan! Mengarahkan ke daftar arsip...');
      setTimeout(() => router.push('/dashboard/arsip'), 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err.response as { data: { message: string } }).data.message || 'Gagal mengunggah surat.');
      } else {
        setError('Gagal mengunggah surat.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Surat Baru</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Formulir Arsip Surat</CardTitle>
            <CardDescription>Isi detail surat dan unggah file PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert variant="default"><AlertTitle>Sukses</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomorSurat">Nomor Surat</Label>
                <Input id="nomorSurat" value={formData.nomorSurat} onChange={handleInputChange} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="judul">Judul Surat</Label>
                <Input id="judul" value={formData.judul} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalSurat">Tanggal Surat</Label>
                <Input id="tanggalSurat" type="date" value={formData.tanggalSurat} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Input id="kategori" value={formData.kategori} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipeSurat">Tipe Surat</Label>
                <select id="tipeSurat" value={formData.tipeSurat} onChange={handleInputChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="masuk">Masuk</option>
                  <option value="keluar">Keluar</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File PDF</Label>
                <Input id="file" type="file" onChange={handleFileChange} accept=".pdf" required />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Mengunggah...' : 'Simpan ke Arsip'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}