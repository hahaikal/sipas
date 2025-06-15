'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { ArrowDownToLine, ArrowUpFromLine, FilePlus2, Users } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - akan diganti dengan data dari API
  const stats = [
    { title: "Surat Masuk", value: "150", icon: ArrowDownToLine, description: "+20.1% dari bulan lalu" },
    { title: "Surat Keluar", value: "74", icon: ArrowUpFromLine, description: "+18.3% dari bulan lalu" },
    { title: "Pendaftar PPDB", value: "235", icon: Users, description: "Tahun Ajaran 2025/2026" },
  ];

  const recentLetters = [
    { no: "001/A/UND/2025", title: "Undangan Rapat Wali Murid", date: "14 Juni 2025" },
    { no: "002/B/SK/2025", title: "SK Panitia Ujian Sekolah", date: "13 Juni 2025" },
    { no: "003/C/EDR/2025", title: "Surat Edaran Libur Semester", date: "12 Juni 2025" },
  ];

  const approvalTasks = [
     { title: "Pengajuan Dana Kegiatan 17 Agustus", from: "Budi (Kesiswaan)" },
     { title: "Permohonan Izin Studi Banding", from: "Siti (Kurikulum)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-poppins">Dashboard</h1>
        <Link href="/dashboard/upload">
          <Button>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Upload Surat Baru
          </Button>
        </Link>
      </div>

      {/* Bagian Tengah (Grid Statistik) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <StatisticCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Bagian Bawah (Dua Kolom) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        
        {/* Kolom Kiri */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tugas & Persetujuan Anda</CardTitle>
            <CardDescription>Surat atau pengajuan yang memerlukan tindakan dari Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {approvalTasks.length > 0 ? (
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Dari</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalTasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.from}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Lihat Detail</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Tidak ada tugas untuk Anda saat ini.</p>
            )}
          </CardContent>
        </Card>

        {/* Kolom Kanan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Surat Terbaru Diarsip</CardTitle>
            <CardDescription>Daftar surat yang baru saja masuk ke sistem.</CardDescription>
          </CardHeader>
          <CardContent>
             {recentLetters.length > 0 ? (
               <div className="space-y-4">
                 {recentLetters.map((letter, index) => (
                   <div key={index} className="flex items-center">
                     <div className="flex-1 space-y-1">
                       <p className="text-sm font-medium leading-none">{letter.title}</p>
                       <p className="text-xs text-muted-foreground">{letter.no}</p>
                     </div>
                     <div className="text-sm text-muted-foreground">{letter.date}</div>
                   </div>
                 ))}
               </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada surat yang diarsipkan.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}