import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { INews } from '@sipas/types/news';

interface NewsSectionProps {
  news: INews[];
}

export function NewsSection({ news }: NewsSectionProps) {
  return (
    <section id="news" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-[var(--font-poppins)]">
            Berita Terbaru dari Sekolah Kami
          </h2>
          <p className="text-xl text-muted-foreground font-[var(--font-inter)]">
            Informasi terkini tentang kegiatan dan pencapaian sekolah
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.length > 0 ? news.slice(0, 3).map((article) => (
            <article
              key={article._id}
              className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border"
            >
              <div className="relative h-48">
                {article.imageUrl && (
                    <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                    />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded font-[var(--font-inter)]">
                    Berita
                  </span>
                  <span className="text-sm text-muted-foreground font-[var(--font-inter)]">{new Date(article.createdAt || '').toLocaleDateString('id-ID')}</span>
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2 font-[var(--font-poppins)]">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3 font-[var(--font-inter)]" dangerouslySetInnerHTML={{ __html: article.content.substring(0, 100) + '...' }}></p>
                <button className="text-primary hover:text-primary/80 font-semibold flex items-center group font-[var(--font-inter)]">
                  Baca Selengkapnya
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </article>
          )) : <p className="col-span-3 text-center text-muted-foreground">Belum ada berita yang dipublikasikan.</p>}
        </div>
      </div>
    </section>
  );
}