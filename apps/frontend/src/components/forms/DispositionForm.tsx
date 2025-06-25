'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@sipas/types';
import { getAllUsers } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const dispositionSchema = z.object({
  toUser: z.string().min(1, 'Penerima harus dipilih.'),
  instructions: z.string().min(5, 'Instruksi minimal 5 karakter.'),
});

type DispositionFormData = z.infer<typeof dispositionSchema>;

interface DispositionFormProps {
  onSubmit: (data: DispositionFormData) => void;
  isLoading?: boolean;
}

export default function DispositionForm({ onSubmit, isLoading }: DispositionFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const form = useForm<DispositionFormData>({ resolver: zodResolver(dispositionSchema) });

  useEffect(() => {
    getAllUsers().then(response => setUsers(response.data)).catch(console.error);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="toUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teruskan kepada:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Pilih pengguna..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user._id} value={user._id}>{user.name} ({user.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruksi / Catatan</FormLabel>
              <FormControl><Textarea rows={4} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Mengirim...' : 'Kirim Disposisi'}</Button>
        </div>
      </form>
    </Form>
  );
}