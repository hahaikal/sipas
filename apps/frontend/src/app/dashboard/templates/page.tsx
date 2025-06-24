'use client';

import { useEffect, useState } from 'react';
import { getTemplateById, getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/services/templateService';
import TemplateForm from '@/components/forms/TemplateForm';
import { LetterTemplate } from '@sipas/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);

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
    if (templateId) {
      const response = await getTemplateById(templateId);
      setEditingTemplate(response.data);
    } else {
      setEditingTemplate(null);
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string; body: string; description?: string }) => {
    setIsSubmitting(true);
    try {
      const usedPlaceholders = Array.from(new Set(data.body.match(/{{(.*?)}}/g) || []));
      const payload: LetterTemplate = { 
        ...data, 
        description: data.description ?? '',
        placeholders: usedPlaceholders.map(p => ({ key: p, description: p.slice(2,-2).replace(/_/g, ' ') })),
        _id: editingTemplate?._id || '',
        schoolId: editingTemplate?.schoolId || '',
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, payload);
      } else {
        await createTemplate(payload);
      }
      setIsFormOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error("Gagal menyimpan template:", error);
      alert('Gagal menyimpan template');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.error("Gagal menghapus template:", error);
      alert('Gagal menghapus template');
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
          <CardDescription>Buat dan kelola template surat berbasis HTML.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Template</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Terakhir Diubah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Memuat...</TableCell></TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>{template.updatedAt ? format(new Date(template.updatedAt), 'dd MMMM yyyy') : '-'}</TableCell>
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
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{editingTemplate ? 'Edit' : 'Buat'} Template Surat</DialogTitle></DialogHeader>
          <TemplateForm 
            onSubmit={handleFormSubmit}
            initialData={editingTemplate}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}