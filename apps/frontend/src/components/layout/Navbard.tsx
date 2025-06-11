'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-end p-4 bg-white dark:bg-gray-800 border-b">
      <div className="flex items-center space-x-4">
        <span>Selamat datang, <strong>{user?.name}</strong>!</span>
        <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
      </div>
    </header>
  );
};

export default Navbar;