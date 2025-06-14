'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { INews } from '@sipas/types/news';

interface NewsFormProps {
    onSubmit: (data: INews) => void;
    initialData?: INews;
    isLoading?: boolean;
}

export default function NewsForm({ onSubmit, initialData, isLoading = false }: NewsFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                content: initialData.content || '',
                imageUrl: initialData.imageUrl || '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Berita</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL Gambar (Opsional)</Label>
                        <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Isi Berita</Label>
                        <Textarea id="content" name="content" value={formData.content} onChange={handleChange} required disabled={isLoading} rows={10} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Simpan Berita'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}