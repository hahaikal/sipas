'use client';

import Link from 'next/link';
import { Home, Upload, Archive, User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Newspaper, GalleryHorizontal } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">SIPAS</h1>
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="/dashboard" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <Home className="mr-3" />
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/dashboard/upload" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <Upload className="mr-3" />
              Upload Surat
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/dashboard/arsip" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <Archive className="mr-3" />
              Daftar Arsip
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/dashboard/user" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <User className="mr-3" />
              Manajemen Pengguna
            </Link>
          </li>
        </ul>
        <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Manajemen Konten</AccordionTrigger>
                <AccordionContent>
                    <Link href="/dashboard/news" className="flex items-center p-3 ...">
                        <Newspaper className="mr-3 h-5 w-5" />
                        Berita
                    </Link>
                    <Link href="/dashboard/galeri" className="flex items-center p-3 ...">
                        <GalleryHorizontal className="mr-3 h-5 w-5" />
                        Galeri
                    </Link>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </nav>
    </div>
  );
};

export default Sidebar;