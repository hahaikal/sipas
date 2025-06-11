'use client';

import { useEffect, useState } from 'react';
import { getAllLetters } from '@/services/letterService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface Letter {
  _id: string;
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  tipeSurat: 'masuk' | 'keluar';
  kategori: string;
}

export default function ArsipPage() {
  const [allLetters, setAllLetters] = useState<Letter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLetters = async () => {
      setIsLoading(true);
      try {
        const response = await getAllLetters();
        setAllLetters(response.data);
        setFilteredLetters(response.data);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
          setError((err.response as { data: { message?: string } }).data.message || 'Gagal memuat data arsip.');
        } else {
          setError('Gagal memuat data arsip.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLetters();
  }, []);

  useEffect(() => {
    const results = allLetters.filter(letter =>
      letter.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLetters(results);
  }, [searchTerm, allLetters]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Daftar Arsip Surat</h1>
      <Card>
        <CardHeader>
          <CardTitle>Semua Arsip</CardTitle>
          <CardDescription>Cari dan kelola semua surat yang telah diarsipkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Cari berdasarkan judul atau nomor surat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {isLoading && <p>Memuat data...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal Surat</TableHead>
                  <TableHead>Tipe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.length > 0 ? (
                  filteredLetters.map((letter) => (
                    <TableRow key={letter._id}>
                      <TableCell>{letter.nomorSurat}</TableCell>
                      <TableCell className="font-medium">{letter.judul}</TableCell>
                      <TableCell>{new Date(letter.tanggalSurat).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{letter.tipeSurat}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada data yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}