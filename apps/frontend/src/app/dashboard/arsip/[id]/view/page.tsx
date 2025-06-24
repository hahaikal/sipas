'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLetterById, getLetterViewUrl, getLetterPreview, approveLetter, rejectLetter } from '@/services/letterService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react'; 
import { Letter } from '@sipas/types';

export default function LetterViewPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string;

    const [letter, setLetter] = useState<Letter | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    function getErrorMessage(err: unknown, fallbackMessage: string): string {
        if (typeof err === 'object' && err !== null && 'response' in err) {
            const response = (err as { response?: { data?: { message?: string } } }).response;
            if (response && response.data && typeof response.data.message === 'string') {
                return response.data.message;
            }
        }
        return fallbackMessage;
    }

    const fetchLetterData = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        setPdfUrl(null);
        setPreviewContent(null);
        try {
            const letterResponse = await getLetterById(id);
            const currentLetter = letterResponse.data;
            setLetter(currentLetter);

            if (currentLetter.status === 'PENDING' || currentLetter.status === 'ARCHIVED') {
                const previewResponse = await getLetterPreview(id);
                setPreviewContent(previewResponse.content);
            } else if (currentLetter.status === 'APPROVED') {
                const urlResponse = await getLetterViewUrl(id);
                setPdfUrl(urlResponse.url);
            }

        } catch (err: unknown) {
            setError(getErrorMessage(err, "Gagal memuat data surat."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLetterData();
    }, [id]);
    
    const handleApprove = async () => {
        setIsActionLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await approveLetter(id);
            setSuccessMessage(response.message); 
            setLetter(response.data); 
            
            const urlResponse = await getLetterViewUrl(id);
            setPdfUrl(urlResponse.url);
            setPreviewContent(null);

        } catch (err: unknown) {
            setError(getErrorMessage(err, "Gagal menyetujui surat."));
        } finally {
            setIsActionLoading(false);
        }
    };
    
    const handleReject = async () => {
        setIsActionLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await rejectLetter(id);
            setSuccessMessage(response.message);
            setLetter(response.data);
            setPreviewContent(null);
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Gagal menolak surat."));
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Memuat dokumen...</div>;
    }
    
    const needsApproval = letter?.status === 'PENDING' || letter?.status === 'ARCHIVED';

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="p-4 border-b bg-card flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold">{letter?.judul || 'Tampilan Dokumen'}</h1>
                    <p className="text-sm text-muted-foreground">{letter?.nomorSurat || `Status: ${letter?.status || 'Diarsipkan'}`}</p>
                </div>

                <div className='flex items-center gap-2'>
                    {user?.role === 'kepala sekolah' && needsApproval && (
                        <div className="flex gap-2">
                            <Button variant="destructive" onClick={handleReject} disabled={isActionLoading}>
                                <X className="mr-2 h-4 w-4"/> Tolak
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isActionLoading}>
                                {isActionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4"/>
                                )}
                                {isActionLoading ? 'Memproses PDF...' : 'Setuju & Terbitkan'}
                            </Button>
                        </div>
                    )}
                    <Button variant="outline" onClick={() => router.push('/dashboard/arsip')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Arsip
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
            {successMessage && <Alert className="mb-4"><AlertTitle>Sukses!</AlertTitle><AlertDescription>{successMessage}</AlertDescription></Alert>}
            {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            
            {pdfUrl && <iframe src={pdfUrl} className="w-full h-[calc(100vh-150px)] border-0" title={letter?.judul} />}
            
            {previewContent && <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg"><pre className="whitespace-pre-wrap font-serif text-gray-800">{previewContent}</pre></div>}
            
            {letter?.status === 'REJECTED' && <Alert variant="destructive"><AlertTitle>Pengajuan Ditolak</AlertTitle><AlertDescription>Pengajuan surat ini telah ditolak dan tidak dapat diproses lebih lanjut.</AlertDescription></Alert>}
            </main>
        </div>
    );
}