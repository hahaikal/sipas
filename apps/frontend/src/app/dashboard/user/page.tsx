'use client';

import { useEffect, useState } from 'react';
import { User } from '@sipas/types';
import { getAllUsers, createUser, CreateUserData, updateUser, UpdateUserData, deleteUser } from '@/services/userService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserForm from '@/components/forms/UserForm';

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
        setError((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        setError('Gagal memuat data pengguna.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: CreateUserData | UpdateUserData) => {
    setFormIsLoading(true);
    try {
      if (editingUser) {
        if (!editingUser._id) {
          alert('User ID tidak ditemukan. Tidak dapat memperbarui pengguna.');
          setFormIsLoading(false);
          return;
        }
        const response = await updateUser(editingUser._id, data);
        setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
      } else {
        const response = await createUser(data as CreateUserData);
        setUsers([...users, response.data]);
      }
      setIsFormOpen(false);
      setEditingUser(null);
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
        alert((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        alert('Operasi gagal.');
      }
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
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
        alert((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        alert('Gagal menghapus pengguna.');
      }
    }
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleFormSubmit}
            initialData={editingUser}
            onClose={() => setIsFormOpen(false)}
            isLoading={formIsLoading}
          />
        </DialogContent>
      </Dialog>

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
                  <TableHead>Telepon</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <TableRow key={user._id ?? index}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <span className="capitalize bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>Edit</DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10">Hapus</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>Tindakan ini akan menghapus pengguna secara permanen.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user._id)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
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