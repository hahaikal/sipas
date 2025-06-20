'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsSection } from '@/components/landing/NewsSection';
import { AchievementsSection } from '@/components/landing/AchievementsSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { 
  BookOpen, 
  Building, 
  Users,
  MapPin, 
  Phone, 
  Mail,
  Target,
  Heart,
  Globe,
  Menu,
  X,
  LogIn
} from 'lucide-react';

import { getPublicNews } from '@/services/newsService';
import { getPublicGalleryItems, GalleryItem } from '@/services/galleryService';
import { getPublicAchievements, Achievement } from '@/services/achievementService';
import { getSubdomain } from '@/lib/subdomain';
import { INews } from '@sipas/types/news';

export default function DashboardPage() {
  const [news, setNews] = useState<INews[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroSlides = [
    {
      image: "https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Membentuk Generasi Unggul",
      subtitle: "Berkarakter dan Kreatif"
    },
    {
      image: "https://images.pexels.com/photos/8471832/pexels-photo-8471832.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Pendidikan Berkualitas",
      subtitle: "Untuk Masa Depan Cerah"
    },
    {
      image: "https://images.pexels.com/photos/8471838/pexels-photo-8471838.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Fasilitas Modern",
      subtitle: "Pembelajaran Optimal"
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Kurikulum Adaptif",
      description: "Kurikulum yang disesuaikan dengan perkembangan zaman dan kebutuhan industri masa depan."
    },
    {
      icon: Building,
      title: "Fasilitas Lengkap",
      description: "Laboratorium modern, perpustakaan digital, dan ruang kelas yang nyaman untuk pembelajaran optimal."
    },
    {
      icon: Users,
      title: "Tenaga Pengajar Profesional",
      description: "Guru-guru berpengalaman dan bersertifikat yang berkomitmen pada keunggulan pendidikan."
    },
    {
      icon: Target,
      title: "Program Unggulan",
      description: "Program khusus untuk mengembangkan bakat dan minat siswa di berbagai bidang."
    },
    {
      icon: Heart,
      title: "Pembentukan Karakter",
      description: "Pendidikan karakter yang kuat untuk membentuk pribadi yang berintegritas."
    },
    {
      icon: Globe,
      title: "Wawasan Global",
      description: "Mempersiapkan siswa untuk menghadapi tantangan global dengan perspektif internasional."
    }
  ];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      const subdomain = getSubdomain();
      if (!subdomain) {
        setError("Subdomain sekolah tidak dapat ditemukan.");
        setIsLoading(false);
        return;
      }

      try {
        const [newsRes, galleryRes, achievementsRes] = await Promise.all([
          getPublicNews(subdomain),
          getPublicGalleryItems(subdomain),
          getPublicAchievements(subdomain)
        ]);

        setNews(newsRes.data || []);
        setGallery(galleryRes.data || []);
        setAchievements(achievementsRes.data || []);

      } catch (err: unknown) {
        console.error("Gagal mengambil data untuk landing page:", err);
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } }).response === "object"
        ) {
          setError(
            ((err as { response?: { data?: { message?: string } } }).response?.data?.message) ||
              "Gagal memuat data sekolah. Silakan coba lagi."
          );
        } else {
          setError("Gagal memuat data sekolah. Silakan coba lagi.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-card/95 backdrop-blur-sm shadow-sm z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl text-foreground font-[var(--font-poppins)]">SMA Unggulan</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Beranda</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Tentang</a>
              <a href="#gallery" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Galeri</a>
              <a href="#news" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Berita</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Kontak</a>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                key={'/Login'}
                href={'/login'}
                className='flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]'
              >
                <LogIn className="w-4 h-4" />
                <span>Login Sekolah</span>
              </Link>
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Daftar Sekarang
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#home" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]" onClick={toggleMobileMenu}>Beranda</a>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]" onClick={toggleMobileMenu}>Tentang</a>
                <a href="#gallery" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]" onClick={toggleMobileMenu}>Galeri</a>
                <a href="#news" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]" onClick={toggleMobileMenu}>Berita</a>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]" onClick={toggleMobileMenu}>Kontak</a>
                <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                  <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-medium justify-start">
                    <LogIn className="w-4 h-4" />
                    <span>Login Sekolah</span>
                  </button>
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-[var(--font-inter)] text-left">
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {error && (
        <div className="container mx-auto py-10 text-center text-destructive bg-destructive/10 rounded-lg my-4">
          <p className="font-semibold">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 animate-fade-in-up animation-delay-200 font-[var(--font-inter)]">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Daftar PPDB Online
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-foreground px-8 py-4 rounded-lg text-lg transition-all duration-300 font-[var(--font-inter)]">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-[var(--font-inter)]">
              Kami berkomitmen memberikan pendidikan terbaik dengan fasilitas modern dan pendekatan pembelajaran yang inovatif
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border ${
                  isVisible.about ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-[var(--font-inter)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="text-center py-20">Memuat data galeri...</div>
      ) : (
        <GallerySection items={gallery} />
      )}
      
      {isLoading ? (
        <div className="text-center py-20">Memuat data berita...</div>
      ) : (
        <NewsSection news={news} />
      )}

      {isLoading ? (
        <div className="text-center py-20">Memuat data prestasi...</div>
      ) : (
        <AchievementsSection achievements={achievements} />
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Hubungi Kami
            </h2>
            <p className="text-xl text-muted-foreground font-[var(--font-inter)]">
              Kami siap membantu Anda dengan informasi lebih lanjut
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Alamat</h3>
                  <p className="text-muted-foreground font-[var(--font-inter)]">
                    Jl. Pendidikan No. 123<br />
                    Kota Pendidikan, Provinsi 12345<br />
                    Indonesia
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Telepon</h3>
                  <p className="text-muted-foreground font-[var(--font-inter)]">
                    (021) 1234-5678<br />
                    (021) 8765-4321
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground font-[var(--font-inter)]">
                    info@smaunggulan.sch.id<br />
                    ppdb@smaunggulan.sch.id
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-lg border">
              <h3 className="text-2xl font-bold text-card-foreground mb-6">Kirim Pesan</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-background text-foreground font-[var(--font-inter)]"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-background text-foreground font-[var(--font-inter)]"
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Pesan
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-background text-foreground font-[var(--font-inter)]"
                    placeholder="Tulis pesan Anda"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg transition-colors font-[var(--font-inter)]"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-card-foreground">SMA Unggulan</span>
              </div>
              <p className="text-muted-foreground leading-relaxed font-[var(--font-inter)]">
                Membentuk generasi unggul, berkarakter, dan kreatif untuk masa depan yang cerah.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Menu</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Beranda</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Tentang</a></li>
                <li><a href="#gallery" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Galeri</a></li>
                <li><a href="#news" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Berita</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Program</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">PPDB Online</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Program Unggulan</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Ekstrakurikuler</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-[var(--font-inter)]">Beasiswa</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Kontak</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground font-[var(--font-inter)]">Jl. Pendidikan No. 123</p>
                <p className="text-muted-foreground font-[var(--font-inter)]">(021) 1234-5678</p>
                <p className="text-muted-foreground font-[var(--font-inter)]">info@smaunggulan.sch.id</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground font-[var(--font-inter)]">
              © 2024 SMA Unggulan. Semua hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}