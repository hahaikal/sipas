import Image from 'next/image';
import { getAllNews } from '@/services/newsService';
import { getAllGalleryItems } from '@/services/galleryService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface News {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}
interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption: string;
}

export default async function HomePage() {
  const [newsResponse, galleryResponse] = await Promise.all([
    getAllNews().catch(err => { console.error("Gagal memuat berita:", err); return null; }),
    getAllGalleryItems().catch(err => { console.error("Gagal memuat galeri:", err); return null; })
  ]);

  const newsList: News[] = newsResponse?.data || [];
  const galleryItems: GalleryItem[] = galleryResponse?.data || [];

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
        <h2 className="text-3xl font-bold font-poppins text-center mb-8">Galeri Kegiatan</h2>
        {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryItems.slice(0, 8).map((item) => (
                    <div key={item._id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={`http://localhost:5000${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}`}
                            alt={item.caption}
                            fill
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