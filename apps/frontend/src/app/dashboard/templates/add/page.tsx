'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TemplateForm from '@/components/forms/TemplateForm';
import { createTemplate } from '@/services/templateService';
import { LetterTemplate } from '@sipas/types';

export default function AddTemplatePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: Omit<LetterTemplate, '_id' | 'schoolId'>) => {
        setIsLoading(true);
        const promise = createTemplate(data).then(() => {
            setTimeout(() => router.push('/dashboard/templates'), 1000);
        });

        toast.promise(promise, {
            loading: 'Menyimpan template baru...',
            success: 'Template berhasil dibuat! Mengarahkan kembali...',
            error: (err) => {
                const message = err?.response?.data?.message || 'Gagal membuat template.';
                return message;
            },
            finally: () => setIsLoading(false),
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Tambah Template Surat Baru</h1>
            <TemplateForm
                onSubmit={onSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}