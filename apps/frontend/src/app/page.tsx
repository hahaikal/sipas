import Link from 'next/link';
import { getAllNews } from '@/services/newsService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { INews } from '@sipas/types/news';


export default async function HomePage() {
  let newsList: INews[] = [];
  let error: string | null = null;

  try {
    const response = await getAllNews();
    newsList = response.data;
  } catch (err) {
    console.error("Failed to fetch news:", err);
    error = "Gagal memuat berita. Silakan coba lagi nanti.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold font-poppins">Selamat Datang di SIPAS</h1>
        <p className="text-xl text-muted-foreground mt-4">Solusi Digital Terpadu untuk Administrasi Sekolah Anda</p>
        <div className="mt-8">
          <Link href="/ppdb">
            <Button size="lg">Pendaftaran Siswa Baru</Button>
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold font-poppins text-center mb-8">Berita & Informasi Terbaru</h2>
        {error && <p className="text-center text-destructive">{error}</p>}
        {!error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.length > 0 ? (
              newsList.map((news) => (
                <Card key={news._id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{news.title}</CardTitle>
                    <CardDescription>
                      Dipublikasikan pada {new Date(news.createdAt ?? '').toLocaleDateString('id-ID')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-4">
                      {news.content}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/berita/${news._id}`} className="w-full">
                      <Button variant="outline" className="w-full">Baca Selengkapnya</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center">Belum ada berita yang dipublikasikan.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}