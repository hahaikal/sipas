import Image from 'next/image';
import { getAllNews } from '@/services/newsService';
import { getAllGalleryItems } from '@/services/galleryService';
import { getAllAchievements } from '@/services/achievementService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface News { _id: string; title: string; content: string; createdAt: string; }
interface GalleryItem { _id: string; imageUrl: string; caption: string; }
interface Achievement { _id: string; title: string; level: string; year: number; achievedBy: string; }

export default async function HomePage() {
  const [newsResponse, galleryResponse, achievementResponse] = await Promise.all([
    getAllNews().catch(() => null),
    getAllGalleryItems().catch(() => null),
    getAllAchievements().catch(() => null)
  ]);

  const newsList: News[] = newsResponse?.data || [];
  const galleryItems: GalleryItem[] = galleryResponse?.data || [];
  const achievements: Achievement[] = achievementResponse?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold font-poppins">Selamat Datang di SIPAS</h1>
        <p className="text-xl text-muted-foreground mt-4">Solusi Digital Terpadu untuk Administrasi Sekolah Anda</p>
        <div className="mt-8">
            <Button size="lg">Pendaftaran Siswa Baru</Button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold font-poppins text-center mb-8">Prestasi & Pencapaian</h2>
        {achievements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.slice(0, 6).map((item) => (
                    <Card key={item._id}>
                        <CardHeader className='flex-row items-center gap-4'>
                            <Trophy className='w-8 h-8 text-yellow-500' />
                            <div>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.level} - {item.year}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>Diraih oleh: <strong>{item.achievedBy}</strong></p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Belum ada data prestasi.</p>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold font-poppins text-center mb-8">Galeri Kegiatan</h2>
        {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryItems.slice(0, 8).map((item) => (
                    <div key={item._id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={item.imageUrl}
                            alt={item.caption}
                            width={300}
                            height={300}
                            unoptimized
                            className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Galeri masih kosong.</p>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold font-poppins text-center mb-8">Berita & Informasi Terbaru</h2>
        {newsList.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsList.map((news) => (
                    <Card key={news._id} className="flex flex-col p-4 space-y-2">
                        <h3 className="text-lg font-semibold">{news.title}</h3>
                        <p className="text-sm text-muted-foreground">{news.content}</p>
                        <p className="text-xs text-muted-foreground">{new Date(news.createdAt).toLocaleDateString()}</p>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Belum ada berita yang dipublikasikan.</p>
        )}
      </section>
    </div>
  );
}