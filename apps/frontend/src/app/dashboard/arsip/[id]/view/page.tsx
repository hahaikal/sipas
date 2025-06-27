'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLetterById, getLetterViewUrl, approveLetter } from '@/services/letterService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { Letter } from '@sipas/types';
import { toast } from 'sonner';

export default function LetterViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [letter, setLetter] = useState<Letter | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLetterData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const letterResponse = await getLetterById(id);
            setLetter(letterResponse.data);

            if (letterResponse.data.status === 'APPROVED' && letterResponse.data.fileUrl) {
                const urlResponse = await getLetterViewUrl(id);
                setPdfUrl(urlResponse.url);
            }
        } catch (err) {
            console.error("Failed to load letter data:", err);
            setError("Gagal memuat surat. Pastikan surat ada dan Anda memiliki akses.");
            toast.error("Gagal memuat detail surat.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLetterData();
    }, [fetchLetterData]);

    const handleApprove = async () => {
        if (!letter) return;
        setIsApproving(true);
        
        const promise = approveLetter(letter._id)
            .then((res) => {
                fetchLetterData();
                return res;
            });

        toast.promise(promise, {
            loading: 'Sedang memproses persetujuan dan membuat PDF...',
            success: (res) => res.message,
            error: (err) => err.response?.data?.message || 'Gagal menyetujui surat.',
            finally: () => setIsApproving(false),
        });
    };

    const renderApprovalActions = () => {
        if (letter?.status === 'PENDING') {
            return (
                <div className="flex gap-2">
                    <Button variant="destructive" disabled={isApproving}>
                        <X className="mr-2 h-4 w-4" /> Tolak
                    </Button>
                    <Button onClick={handleApprove} disabled={isApproving}>
                        {isApproving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-4 w-4" />
                        )}
                        {isApproving ? 'Memproses...' : 'Setuju & Generate PDF'}
                    </Button>
                </div>
            );
        }
        return null;
    };
    
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
                    <p className="text-sm text-muted-foreground">{letter?.nomorSurat} - <span className="font-bold">{letter?.status}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    {renderApprovalActions()}
                    <Button variant="outline" onClick={() => router.push('/dashboard/arsip')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Arsip
                    </Button>
                </div>
            </header>
            <main className="flex-1">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title={letter?.judul || 'PDF Viewer'}
                    />
                ) : (
                    <div className="p-8">
                        <h2 className="text-xl font-semibold mb-4">Preview Konten Surat</h2>
                        <div className="border rounded-md p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: letter?.body || '<p>Konten surat tidak tersedia untuk preview.</p>' }}></div>
                        <p className="mt-4 text-muted-foreground">Dokumen PDF akan dibuat setelah surat disetujui.</p>
                    </div>
                )}
            </main>
        </div>
    );
}