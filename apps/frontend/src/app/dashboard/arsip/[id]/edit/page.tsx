'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLetterById, updateLetter, UpdateLetterData } from '@/services/letterService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EditLetterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<UpdateLetterData>({
    nomorSurat: '',
    judul: '',
    tanggalSurat: '',
    kategori: '',
    tipeSurat: 'masuk',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchLetterData = async () => {
      setIsLoading(true);
      try {
        const response = await getLetterById(id);
        const letter = response.data;
        const formattedDate = new Date(letter.tanggalSurat).toISOString().split('T')[0];
        setFormData({ ...letter, tanggalSurat: formattedDate });
      } catch {
        setError('Gagal memuat data surat.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetterData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateLetter(id, formData);
      setSuccess('Surat berhasil diperbarui! Mengarahkan kembali ke daftar arsip...');
      setTimeout(() => router.push('/dashboard/arsip'), 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err.response as { data: { message?: string } }).data.message || 'Gagal memperbarui surat.');
      } else {
        setError('Gagal memperbarui surat.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.judul) return <p>Memuat form...</p>;
  if (error && !formData.judul) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Arsip Surat</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Formulir Edit Surat</CardTitle>
            <CardDescription>Perbarui detail surat yang dipilih.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert><AlertTitle>Sukses</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

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
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}