'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLetterById, getLetterViewUrl, approveLetter, rejectLetter } from '@/services/letterService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Letter } from '@sipas/types';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function LetterViewPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [letter, setLetter] = useState<Letter | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchLetterData = async () => {
            try {
                const [urlResponse, letterResponse] = await Promise.all([
                    getLetterViewUrl(id),
                    getLetterById(id)
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

    const handleApprove = async () => {
        if (!letter) return;
        setIsSubmitting(true);
        try {
            await approveLetter(letter._id);
            alert('Surat berhasil disetujui!');
            router.push('/dashboard/arsip');
        } catch {
            alert('Gagal menyetujui surat.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!letter || !rejectionReason) {
            alert('Alasan penolakan harus diisi.');
            return;
        }
        setIsSubmitting(true);
        try {
            await rejectLetter(letter._id, rejectionReason);
            alert('Surat berhasil ditolak.');
            router.push('/dashboard/arsip');
        } catch {
            alert('Gagal menolak surat.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canApprove = user?.role === 'kepala sekolah' && letter?.status === 'PENDING';

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b bg-card flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">{letter?.judul || 'Tampilan Dokumen'}</h1>
                    <p className="text-sm text-muted-foreground">{letter?.nomorSurat}</p>
                </div>
                <div className="flex items-center gap-2">
                    {canApprove && (
                        <>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" disabled={isSubmitting}>Tolak</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Alasan Penolakan</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Label htmlFor="reason">Berikan alasan mengapa surat ini ditolak.</Label>
                                        <Textarea id="reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                        <Button onClick={handleReject} disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Kirim Penolakan'}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                {isSubmitting ? 'Memproses...' : 'Setuju'}
                            </Button>
                        </>
                    )}
                    <Button variant="outline" onClick={() => router.push('/dashboard/arsip')} disabled={isSubmitting}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Arsip
                    </Button>
                </div>
            </header>
            <main className="flex-1">
                {pdfUrl ? <iframe src={pdfUrl} className="w-full h-full border-0" title={letter?.judul || 'PDF Viewer'} /> : <div>Memuat dokumen...</div>}
            </main>
        </div>
    );
}