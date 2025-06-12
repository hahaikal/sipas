'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@sipas/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormProps {
  onSubmit: (data: { name: string; email: string; phone: string; password?: string; role: UserRole }) => void;
  initialData?: User | null;
  onClose: () => void;
  isLoading?: boolean;
}

export default function UserForm({ onSubmit, initialData, onClose, isLoading = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'guru' as UserRole,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        password: '',
        role: initialData.role,
      });
    } else {
      setFormData({ name: '', email: '', phone: '', password: '', role: 'guru' });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { password, ...rest } = formData;
    const dataToSubmit = initialData && !password ? rest : formData;
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Nama</Label>
        <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required disabled={isLoading} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" required disabled={isLoading} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">Telepon</Label>
        <Input id="phone" value={formData.phone} onChange={handleInputChange} className="col-span-3" required disabled={isLoading} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password} 
          onChange={handleInputChange} 
          className="col-span-3" 
          placeholder={initialData ? "Kosongkan jika tidak ingin diubah" : ""}
          required={!initialData}
          disabled={isLoading} 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="role" className="text-right">Peran</Label>
        <Select onValueChange={handleRoleChange} value={formData.role} disabled={isLoading}>
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
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
}