'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAllLetters } from '@/services/letterService';
import { Letter } from '@sipas/types';

export const PendingApprovalsTable = () => {
  const [pendingLetters, setPendingLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingLetters = async () => {
      try {
        setIsLoading(true);
        const response = await getAllLetters({ status: 'PENDING' });
        setPendingLetters(response.data);
      } catch (error) {
        console.error("Gagal mengambil data persetujuan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingLetters();
  }, []);

  if (isLoading) {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Tugas Persetujuan Surat</CardTitle>
                <CardDescription>Daftar surat yang memerlukan tindakan dari Anda.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">Memuat data...</CardContent>
        </Card>
    );
  }

  if (pendingLetters.length === 0) {
    return null;
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Tugas Persetujuan Surat</CardTitle>
        <CardDescription>Daftar surat yang memerlukan tindakan dari Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul Surat</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingLetters.map((letter) => (
              <TableRow key={letter._id}>
                <TableCell className="font-medium">{letter.judul}</TableCell>
                <TableCell>{letter.createdBy || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/arsip/${letter._id}/view`}>
                    <Button variant="outline" size="sm">Lihat & Setujui</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};