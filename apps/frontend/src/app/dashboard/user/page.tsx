'use client';

import { useEffect, useState } from 'react';
import { User, UserRole } from '@sipas/types';
import { getAllUsers, createUser, CreateUserData } from '@/services/userService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({ name: '', email: '', phone: '', password: '', role: 'guru' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err.response as { data: { message?: string } }).data?.message || 'Gagal memuat data pengguna.');
      } else {
        setError('Gagal memuat data pengguna.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewUser(prev => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };

  const handleAddUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const response = await createUser(newUser);
        setUsers(prevUsers => [...prevUsers, response.data]);
        setIsDialogOpen(false);
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'guru' });
    } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'data' in err.response &&
          err.response.data &&
          typeof err.response.data === 'object' &&
          'message' in err.response.data
        ) {
          alert((err.response as { data: { message?: string } }).data?.message || 'Gagal membuat pengguna.');
        } else {
          alert('Gagal membuat pengguna.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddUserSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Isi detail di bawah ini untuk membuat akun baru.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nama</Label>
                  <Input id="name" value={newUser.name} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={newUser.email} onChange={handleInputChange} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Telepon</Label>
                  <Input id="phone" value={newUser.phone} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" type="password" value={newUser.password} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Peran</Label>
                   <Select onValueChange={handleRoleChange} defaultValue={newUser.role}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="kepala sekolah">Kepala Sekolah</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Pengguna'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna Sistem</CardTitle>
          <CardDescription>Kelola semua akun yang memiliki akses ke SIPAS.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Memuat data...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nomor Telepon</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}> 
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <span className="capitalize bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data pengguna.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}