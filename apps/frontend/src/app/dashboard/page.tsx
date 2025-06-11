'use client';

import { useEffect, useState } from 'react';
import { getAllLetters } from '@/services/letterService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Letter {
  _id: string;
  nomorSurat: string;
  judul: string;
  tanggalSurat: string;
  tipeSurat: 'masuk' | 'keluar';
}

export default function DashboardPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await getAllLetters();
        const mappedLetters: Letter[] = response.data.map((item: any) => ({
          _id: item._id,
          nomorSurat: item.nomorSurat,
          judul: item.judul,
          tanggalSurat: item.tanggalSurat,
          tipeSurat: item.tipeSurat as 'masuk' | 'keluar',
        }));
        setLetters(mappedLetters);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
          setError((err.response as { data: { message: string } }).data.message);
        } else {
          setError('Gagal memuat data surat.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetters();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/upload">
          <Button>Upload Surat Baru</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arsip Surat Terbaru</CardTitle>
          <CardDescription>Berikut adalah daftar surat yang baru diarsipkan.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Memuat data surat...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && (
            <div className="space-y-4">
              {letters.length > 0 ? (
                letters.map((letter) => (
                  <div key={letter._id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{letter.judul}</p>
                      <p className="text-sm text-muted-foreground">{letter.nomorSurat} - {new Date(letter.tanggalSurat).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${letter.tipeSurat === 'masuk' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {letter.tipeSurat}
                    </span>
                  </div>
                ))
              ) : (
                <p>Belum ada surat yang diarsipkan.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}