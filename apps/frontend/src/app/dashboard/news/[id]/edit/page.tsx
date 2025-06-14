'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNewsById, updateNews } from '@/services/newsService';
import NewsForm from '@/components/forms/NewsForm';
import { INews } from '@sipas/types/news';

export default function EditNewsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [initialData, setInitialData] = useState<INews | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchNews = async () => {
                try {
                    const response = await getNewsById(id);
                    setInitialData(response.data);
                } catch (error) {
                    console.error('Failed to fetch news data', error);
                }
            };
            fetchNews();
        }
    }, [id]);

    const handleSubmit = async (data: INews) => {
        setIsLoading(true);
        try {
            await updateNews(id, data);
            router.push('/dashboard/berita');
        } catch (error) {
            console.error('Failed to update news', error);
            alert('Gagal memperbarui berita.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!initialData) return <div>Memuat data berita...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Berita</h1>
            <NewsForm onSubmit={handleSubmit} initialData={initialData} isLoading={isLoading} />
        </div>
    );
}
