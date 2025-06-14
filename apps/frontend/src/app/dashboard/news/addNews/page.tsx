'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNews } from '@/services/newsService';
import NewsForm from '@/components/forms/NewsForm';
import { INews } from '@sipas/types/news';

export default function AddNewsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: INews) => {
        setIsLoading(true);
        try {
            await createNews(data);
            router.push('/dashboard/berita');
        } catch (error) {
            console.error('Failed to create news', error);
            alert('Gagal membuat berita.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Tambah Berita Baru</h1>
            <NewsForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
