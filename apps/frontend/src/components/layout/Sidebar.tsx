'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Archive, User, Newspaper, GalleryHorizontal, Award, FileText, Building2, Settings, FileCog } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/arsip", label: "Daftar Arsip", icon: Archive },
    { href: "/dashboard/upload", label: "Upload Surat", icon: Upload },
    { href: "#", label: "Pembuatan Surat", icon: FileText },
  ];

  const adminLinks = [
    { href: "/dashboard/user", label: "Manajemen Pengguna", icon: User },
    { href: "/dashboard/settings", label: "Pengaturan Sekolah", icon: Settings },
    { href: "/dashboard/templates", label: "Manajemen Template", icon: FileCog },
  ];

  const contentLinks = [
     { href: "/dashboard/news", label: "Berita", icon: Newspaper },
     { href: "/dashboard/galeri", label: "Galeri", icon: GalleryHorizontal },
     { href: "/dashboard/pencapaian", label: "Pencapaian", icon: Award },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col border-r border-slate-200">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-poppins text-gray-800">SIPAS</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors",
              pathname.startsWith(link.href) && link.href !== '/dashboard' || pathname === link.href ? "bg-primary/10 text-primary font-semibold" : ""
            )}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        ))}
        
        {user?.role === 'admin' && (
          <>
            <div className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase">Admin Area</div>
            {adminLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors",
                  pathname.startsWith(link.href) && "bg-primary/10 text-primary font-semibold"
                )}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger className="p-2 text-gray-600 hover:bg-gray-100 hover:no-underline rounded-lg">
                    <div className="flex items-center gap-3">
                      <Newspaper className="w-5 h-5" />
                      <span>Manajemen Konten</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6">
                    {contentLinks.map(link => (
                       <Link key={link.href} href={link.href} className={cn(
                         "flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors",
                         pathname.startsWith(link.href) && "bg-primary/10 text-primary font-semibold"
                       )}>
                          <link.icon className="w-5 h-5" />
                          <span>{link.label}</span>
                      </Link>
                    ))}
                  </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;