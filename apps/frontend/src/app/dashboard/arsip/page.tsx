'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { deleteLetter, getAllLetters } from '@/services/letterService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, FilePenLine, Eye } from 'lucide-react';
import Link from 'next/link';
import { Letter } from '@sipas/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ArsipPage() {
  const { user } = useAuth();
  const [allLetters, setAllLetters] = useState<Letter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'kepala sekolah') {
      fetchLetters();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchLetters = async () => {
    setIsLoading(true);
    try {
      const response = await getAllLetters();
      setAllLetters(response.data);
      setFilteredLetters(response.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err.response as { data: { message: string } }).data.message);
      } else {
        setError('Gagal memuat data arsip.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const results = allLetters.filter(letter =>
      letter.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLetters(results);
  }, [searchTerm, allLetters]);

  const handleDelete = async (id: string) => {
    try {
        await deleteLetter(id);
        setAllLetters(prev => prev.filter(letter => letter._id !== id));
    } catch (err) {
        console.error("Gagal menghapus surat:", err);
    }
  };

  const getStatusVariant = (status?: string) => {
    switch(status) {
        case 'APPROVED': return 'default';
        case 'PENDING': return 'secondary';
        case 'REJECTED': return 'destructive';
        default: return 'outline';
    }
  }

  if (user?.role !== 'admin' && user?.role !== 'kepala sekolah') {
    return <p className="text-center text-red-600 font-semibold mt-8">Anda tidak memiliki akses ke halaman ini.</p>;
  }

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
          {isLoading ? <p>Memuat data...</p> : error ? <p className="text-destructive">{error}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.length > 0 ? (
                  filteredLetters.map((letter) => (
                    <TableRow key={letter._id}>
                      <TableCell className="font-medium">{letter.judul}</TableCell>
                      <TableCell>{letter.nomorSurat || '-'}</TableCell>
                      <TableCell>
                        {letter.status ? (
                            <Badge variant={getStatusVariant(letter.status)}>{letter.status}</Badge>
                        ) : (
                            <Badge variant="outline">{letter.tipeSurat}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Link href={`/dashboard/arsip/${letter._id}/view`}>
                          <Button 
                            variant="outline" 
                            size="icon"
                            disabled={user?.role === 'guru' && letter.status === 'PENDING'} 
                            title={user?.role === 'guru' && letter.status === 'PENDING' ? 'Menunggu persetujuan' : 'Lihat Detail'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {user?.role === 'admin' && (letter.tipeSurat as string) !== 'generated' && (
                            <>
                                <Link href={`/dashboard/arsip/${letter._id}/edit`}>
                                <Button variant="outline" size="icon"><FilePenLine className="h-4 w-4" /></Button>
                                </Link>
                                <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus surat secara permanen.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(letter._id)}>Ya, Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Tidak ada data yang ditemukan.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
