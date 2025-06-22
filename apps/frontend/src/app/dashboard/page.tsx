'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { ArrowDownToLine, ArrowUpFromLine, FilePlus2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/services/dashboardService';
import { getLatestLetters } from '@/services/letterService';
import ApprovalTasksComponent from '@/components/dashboard/ApprovalTasksComponent';
import { Letter } from '@sipas/types';

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState([
    { title: "Surat Masuk", value: "0", icon: ArrowDownToLine, description: "" },
    { title: "Surat Keluar", value: "0", icon: ArrowUpFromLine, description: "" },
    { title: "Pendaftar PPDB", value: "0", icon: Users, description: "" },
  ]);

  const [recentLetters, setRecentLetters] = useState<Letter[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats([
          { title: "Surat Masuk", value: data.suratMasuk.toString(), icon: ArrowDownToLine, description: "" },
          { title: "Surat Keluar", value: data.suratKeluar.toString(), icon: ArrowUpFromLine, description: "" },
          { title: "Pendaftar PPDB", value: data.pendaftarPpdb.toString(), icon: Users, description: "" },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }

    async function fetchRecentLetters() {
      try {
        const letters = await getLatestLetters(5);
        setRecentLetters(letters);
      } catch (error) {
        console.error("Failed to fetch recent letters", error);
      }
    }

    fetchStats();
    fetchRecentLetters();
  }, []);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <StatisticCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tugas & Persetujuan Anda</CardTitle>
            <CardDescription>Surat atau pengajuan yang memerlukan tindakan dari Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.role === 'kepala sekolah' ? (
              <ApprovalTasksComponent />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Tidak ada tugas untuk Anda saat ini.</p>
            )}
          </CardContent>
        </Card>

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
                      <p className="text-sm font-medium leading-none">{letter.judul}</p>
                      <p className="text-xs text-muted-foreground">{letter.nomorSurat}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{new Date(letter.tanggalSurat).toLocaleDateString('id-ID')}</div>
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
