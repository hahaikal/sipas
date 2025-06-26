'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllTemplates } from '@/services/templateService';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LetterTemplate } from '@sipas/types';

export default function AjukanSuratPage() {
    const [templates, setTemplates] = useState<Pick<LetterTemplate, '_id' | 'name' | 'description'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getAllTemplates();
                setTemplates(response.data);
            } catch (error) {
                console.error("Gagal memuat template", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    if (isLoading) return <div>Memuat template...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Ajukan Surat Baru</h1>
            <p className="text-muted-foreground">Pilih salah satu template di bawah ini untuk memulai pembuatan surat digital.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <Link key={template._id} href={`/dashboard/ajukan-surat/${template._id}`}>
                        <Card className="hover:border-primary hover:shadow-lg transition-all h-full">
                            <CardHeader>
                                <CardTitle>{template.name}</CardTitle>
                                <CardDescription>{template.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}