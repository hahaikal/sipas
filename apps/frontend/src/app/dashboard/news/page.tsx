'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllNews, deleteNews } from '@/services/newsService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { INews } from '@sipas/types/news';

export default function ManageNewsPage() {
    const [newsList, setNewsList] = useState<INews[]>([]);

    useEffect(() => {
        getAllNews().then(res => setNewsList(res.data));
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Anda yakin ingin menghapus berita ini?')) {
            await deleteNews(id);
            getAllNews().then(res => setNewsList(res.data));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manajemen Berita</h1>
                <Link href="/dashboard/news/addNews">
                    <Button><PlusCircle className="mr-2 h-4 w-4" />Tambah Berita</Button>
                </Link>
            </div>
            <Table>
                <TableHeader>
                    <TableRow><TableHead>Judul</TableHead><TableHead>Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                    {newsList.map((news: INews) => (
                        <TableRow key={news._id}>
                            <TableCell>{news.title}</TableCell>
                            <TableCell className="flex gap-2 justify-end">
                                <Link href={`/dashboard/news/${news._id ?? ''}/edit`}>
                                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                </Link>
                                <Button variant="destructive" size="icon" onClick={() => news._id && handleDelete(news._id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
