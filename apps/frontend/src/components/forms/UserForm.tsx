'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@sipas/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = (isEditing: boolean) => z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }),
  password: isEditing
    ? z.string().optional()
    : z.string().min(6, { message: "Password wajib diisi, minimal 6 karakter." }),
  role: z.enum(['admin', 'guru', 'kepala sekolah']),
  jabatan: z.string().optional(),
  nuptk: z.string().optional(),
  golongan: z.string().optional(),
});


interface UserFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof formSchema>>) => void;
  initialData?: User | null;
  onClose: () => void;
  isLoading?: boolean;
}

export default function UserForm({ onSubmit, initialData, onClose, isLoading = false }: UserFormProps) {
  const isEditing = !!initialData;

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(isEditing)),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      password: '',
      role: initialData?.role || 'guru',
      jabatan: initialData?.jabatan || '',
      nuptk: initialData?.nuptk || '',
      golongan: initialData?.golongan || '',
    },
  });

  const handleSubmit = (values: z.infer<ReturnType<typeof formSchema>>) => {
    const dataToSubmit = { ...values };

    if (isEditing && !dataToSubmit.password) {
      delete (dataToSubmit as Partial<typeof dataToSubmit>).password;
    }

    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4"><FormLabel className="text-right">Nama</FormLabel><FormControl><Input {...field} className="col-span-3" disabled={isLoading} /></FormControl><FormMessage className="col-span-4 text-right" /></FormItem>
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
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={isEditing ? "Kosongkan jika tidak diubah" : ""}
                      className="col-span-3"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4"><FormLabel className="text-right">Peran</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}><FormControl><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih peran" /></SelectTrigger></FormControl><SelectContent><SelectItem value="guru">Guru</SelectItem><SelectItem value="kepala sekolah">Kepala Sekolah</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage className="col-span-4 text-right" /></FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="jabatan"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Jabatan</FormLabel>
              <FormControl>
                <Input {...field} className="col-span-3" placeholder="Contoh: Guru Kelas" disabled={isLoading} />
              </FormControl>
              <FormMessage className="col-span-4 text-right" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nuptk"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">NUPTK</FormLabel>
              <FormControl>
                <Input {...field} className="col-span-3" placeholder="Masukkan NUPTK (opsional)" disabled={isLoading} />
              </FormControl>
              <FormMessage className="col-span-4 text-right" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="golongan"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Golongan</FormLabel>
              <FormControl>
                <Input {...field} className="col-span-3" placeholder="Contoh: III/a (opsional)" disabled={isLoading} />
              </FormControl>
              <FormMessage className="col-span-4 text-right" />
            </FormItem>
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