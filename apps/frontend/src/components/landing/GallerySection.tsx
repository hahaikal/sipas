import Image from 'next/image';
import { GalleryItem } from '@/services/galleryService';

interface GallerySectionProps {
  items: GalleryItem[];
}

export function GallerySection({ items }: GallerySectionProps) {
  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-[var(--font-poppins)]">
            Momen Tak Terlupakan
          </h2>
          <p className="text-xl text-muted-foreground font-[var(--font-inter)]">
            Dokumentasi kegiatan dan pencapaian siswa-siswi kami
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative w-full h-64 sm:h-72 lg:h-80">
                  <Image
                    src={item.imageUrl}
                    alt={item.caption}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold mt-2 font-[var(--font-poppins)]">{item.caption}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Belum ada foto di galeri yang bisa ditampilkan.</p>
        )}
      </div>
    </section>
  );
}