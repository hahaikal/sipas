'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLetterById, getLetterViewUrl } from '@/services/letterService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Letter } from '@sipas/types';

export default function LetterViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [letter, setLetter] = useState<Letter | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchLetterData = async () => {
            try {
                const [urlResponse, letterResponse] = await Promise.all([
                    getLetterViewUrl(id, "smaharapanbangsa"),
                    getLetterById(id, "smaharapanbangsa")
                ]);

                setPdfUrl(urlResponse.url);
                setLetter(letterResponse.data);
            } catch (err) {
                console.error("Failed to load letter data:", err);
                setError("Gagal memuat surat. Pastikan surat ada dan Anda memiliki akses.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLetterData();
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Memuat dokumen...</div>;
    }

    if (error) {
        return (
             <div className="flex flex-col justify-center items-center h-screen gap-4">
                <p className="text-destructive">{error}</p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b bg-card flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">{letter?.judul || 'Tampilan Dokumen'}</h1>
                    <p className="text-sm text-muted-foreground">{letter?.nomorSurat}</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard/arsip')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Arsip
                </Button>
            </header>
            <main className="flex-1">
                <iframe
                    src={pdfUrl ?? undefined}
                    className="w-full h-full border-0"
                    title={letter?.judul || 'PDF Viewer'}
                />
            </main>
        </div>
    );
}