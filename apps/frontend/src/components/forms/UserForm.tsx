'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@sipas/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const formSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }),
  password: z.string().optional(),
  role: z.enum(['admin', 'guru', 'kepala sekolah']),
}).refine(data => {
  if (!data.password) {
      const context = z.getParsedType(data);
      if (context === 'object' && !('initialData' in data)) {
        return false;
      }
  }
  return true;
}, {
    message: "Password wajib diisi untuk pengguna baru.",
    path: ["password"],
});


interface UserFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: User | null;
  onClose: () => void;
  isLoading?: boolean;
}

export default function UserForm({ onSubmit, initialData, onClose, isLoading = false }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      password: '',
      role: initialData?.role || 'guru',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData && !values.password) {
      delete values.password;
    }
    onSubmit(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Nama</FormLabel>
              <FormControl>
                <Input {...field} className="col-span-3" disabled={isLoading} />
              </FormControl>
              <FormMessage className="col-span-4 text-right" />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4"><FormLabel className="text-right">Email</FormLabel><FormControl><Input {...field} type="email" className="col-span-3" disabled={isLoading} /></FormControl><FormMessage className="col-span-4 text-right" /></FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4"><FormLabel className="text-right">Telepon</FormLabel><FormControl><Input {...field} className="col-span-3" disabled={isLoading} /></FormControl><FormMessage className="col-span-4 text-right" /></FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4"><FormLabel className="text-right">Password</FormLabel><FormControl><Input {...field} type="password" placeholder={initialData ? "Kosongkan jika tidak diubah" : ""} className="col-span-3" disabled={isLoading} /></FormControl><FormMessage className="col-span-4 text-right" /></FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4"><FormLabel className="text-right">Peran</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}><FormControl><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih peran" /></SelectTrigger></FormControl><SelectContent><SelectItem value="guru">Guru</SelectItem><SelectItem value="kepala sekolah">Kepala Sekolah</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage className="col-span-4 text-right" /></FormItem>
            )}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
        </div>
      </form>
    </Form>
  );
}