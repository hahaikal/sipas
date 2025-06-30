'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle, Maximize2, Minimize2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LetterTemplate, getAllTemplates, deleteTemplate } from '@/services/templateService';
import TemplateForm from '@/components/forms/TemplateForm';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
    const [isFormMaximized, setFormMaximized] = useState(false);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await getAllTemplates();
            setTemplates(response.data);
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setFormMaximized(false); 
        fetchTemplates();
    };
    
    const handleOpenChange = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setFormMaximized(false); 
        }
    };

    const openAddDialog = () => {
        setEditingTemplate(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (template: LetterTemplate) => {
        setEditingTemplate(template);
        setIsFormOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            try {
                await deleteTemplate(id);
                fetchTemplates();
            } catch {
                alert('Gagal menghapus template.');
            }
        }
    };

    const toggleMaximize = () => {
        setFormMaximized(!isFormMaximized);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manajemen Template Surat</h1>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Template Baru
                </Button>
            </div>

            <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
                <DialogContent className={cn(
                    "transition-all duration-300 ease-in-out flex flex-col",
                    isFormMaximized ? "w-[95vw] h-[95vh] max-w-none" : "max-w-6xl"
                )}>
                    <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMaximize}
                                className="h-8 w-8"
                                title={isFormMaximized ? "Minimize" : "Maximize"}
                            >
                                {isFormMaximized ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex-grow overflow-hidden">
                      <TemplateForm 
                          initialData={editingTemplate} 
                          onSuccess={handleFormSuccess}
                          onMaximizeToggle={setFormMaximized}
                      />
                    </div>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Template</CardTitle>
                    <CardDescription>Kelola semua template surat yang tersedia untuk pembuatan surat otomatis.</CardDescription>
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
                                <TableRow><TableCell colSpan={3} className="text-center">Memuat data...</TableCell></TableRow>
                            ) : templates.length > 0 ? (
                                templates.map(template => (
                                    <TableRow key={template._id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>{template.description}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(template)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(template._id)} className="text-destructive">Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">Belum ada template.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}