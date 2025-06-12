'use client';

import Link from 'next/link';
import { Home, Upload, Archive, User } from 'lucide-react';

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
      </nav>
    </div>
  );
};

export default Sidebar;