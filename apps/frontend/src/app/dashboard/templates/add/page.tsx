'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TemplateForm from '@/components/forms/TemplateForm';

export default function AddTemplatePage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success('Template berhasil dibuat! Mengarahkan kembali...');
        setTimeout(() => router.push('/dashboard/templates'), 1500);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Tambah Template Surat Baru</h1>
            <TemplateForm
                onSuccess={handleSuccess}
            />
        </div>
    );
}
