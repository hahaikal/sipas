'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TemplateForm from '@/components/forms/TemplateForm';
import { getTemplateById, updateTemplate } from '@/services/templateService';
import { LetterTemplate } from '@sipas/types';

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const templateId = params.templateId as string;

    const [initialData, setInitialData] = useState<LetterTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (templateId) {
            setIsFetching(true);
            getTemplateById(templateId)
                .then(response => {
                    setInitialData(response.data);
                })
                .catch(error => {
                    const message = error.response?.data?.message || 'Gagal memuat data template.';
                    toast.error(message);
                    router.push('/dashboard/templates');
                })
                .finally(() => setIsFetching(false));
        }
    }, [templateId, router]);

    const onSubmit = async (data: Omit<LetterTemplate, '_id' | 'schoolId'>) => {
        setIsLoading(true);
        const promise = updateTemplate(templateId, data).then(() => {
            setTimeout(() => router.push('/dashboard/templates'), 1000);
        });

        toast.promise(promise, {
            loading: 'Memperbarui template...',
            success: 'Template berhasil diperbarui! Mengarahkan kembali...',
            error: (err) => {
                const message = err?.response?.data?.message || 'Gagal memperbarui template.';
                return message;
            },
            finally: () => setIsLoading(false),
        });
    };

    if (isFetching || !initialData) {
        return <div>Memuat data template...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Template: {initialData.name}</h1>
            <TemplateForm
                initialData={initialData}
                onSubmit={onSubmit}
                isLoading={isLoading || isFetching}
            />
        </div>
    );
}