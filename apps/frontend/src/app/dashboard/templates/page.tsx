'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, CreateTemplateData, UpdateTemplateData } from '@/services/templateService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import { LetterTemplate } from '@sipas/types';

const requiredInputSchema = z.object({
  name: z.string().min(1, 'Nama field harus diisi'),
  label: z.string().min(1, 'Label field harus diisi'),
  type: z.enum(['text', 'textarea', 'date', 'number']),
});

const templateSchema = z.object({
  name: z.string().min(3, 'Nama template minimal 3 karakter.'),
  description: z.string().min(1, 'Deskripsi harus diisi.'),
  body: z.string().min(10, 'Isi template minimal 10 karakter.'),
  requiredInputs: z.array(requiredInputSchema),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState<Pick<LetterTemplate, '_id' | 'name' | 'description'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      body: '',
      requiredInputs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requiredInputs"
  });

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Gagal memuat templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenForm = async (templateId?: string) => {
    form.reset();
    if (templateId) {
      const response = await getTemplateById(templateId);
      setEditingTemplate(response.data);
      form.setValue('name', response.data.name);
      form.setValue('description', response.data.description);
      form.setValue('body', response.data.body);
      form.setValue('requiredInputs', response.data.requiredInputs);
    } else {
      setEditingTemplate(null);
    }
    setIsFormOpen(true);
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, data as UpdateTemplateData);
      } else {
        await createTemplate(data as CreateTemplateData);
      }
      setIsFormOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error("Gagal menyimpan template:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.error("Gagal menghapus template:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Template Surat</h1>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Template Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Template</CardTitle>
          <CardDescription>Buat dan kelola template untuk pembuatan surat digital.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Template</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Memuat...</TableCell></TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button variant="outline" size="icon" onClick={() => handleOpenForm(template._id)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Anda Yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus template secara permanen.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(template._id)}>Ya, Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editingTemplate ? 'Edit' : 'Buat'} Template Surat</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Template</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="body" control={form.control} render={({ field }) => (<FormItem><FormLabel>Isi Surat (Gunakan {'{nama_field}'} untuk placeholder)</FormLabel><FormControl><Textarea {...field} rows={10} /></FormControl><FormMessage /></FormItem>)} />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Input yang Diperlukan</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start border p-2 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                      <FormField control={form.control} name={`requiredInputs.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Nama Field</FormLabel><FormControl><Input {...field} placeholder="e.g., nama_kegiatan" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`requiredInputs.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Label Form</FormLabel><FormControl><Input {...field} placeholder="e.g., Nama Kegiatan" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`requiredInputs.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Tipe Input</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="text">Text</SelectItem><SelectItem value="textarea">Textarea</SelectItem><SelectItem value="date">Date</SelectItem><SelectItem value="number">Number</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="mt-7" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', label: '', type: 'text' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Field
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">Simpan Template</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}