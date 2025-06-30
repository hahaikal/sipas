'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LetterTemplate, getAllTemplates, deleteTemplate } from '@/services/templateService';
import { toast } from 'sonner';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await getAllTemplates();
            setTemplates(response.data);
        } catch (error) {
            console.error("Failed to fetch templates", error);
            toast.error("Gagal memuat data template.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);
    
    const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            const promise = deleteTemplate(id).then(() => {
                fetchTemplates();
            });

            toast.promise(promise, {
                loading: 'Menghapus template...',
                success: 'Template berhasil dihapus.',
                error: 'Gagal menghapus template.',
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manajemen Template Surat</h1>
                <Link href="/dashboard/templates/add">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Template Baru
                    </Button>
                </Link>
            </div>

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
                                                    <Link href={`/dashboard/templates/${template._id}/edit`}>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </Link>
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