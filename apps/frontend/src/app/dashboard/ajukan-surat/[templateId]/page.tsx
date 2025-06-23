'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { getTemplateById, RequiredInput } from '@/services/templateService';
import { generateLetterFromTemplate } from '@/services/letterService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LetterTemplate } from '@sipas/types';

import { Control, FieldValues } from 'react-hook-form';

const renderFormField = (control: Control<FieldValues>, input: RequiredInput) => {
    return (
        <FormField
            key={input.name}
            control={control}
            name={input.name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{input.label}</FormLabel>
                    <FormControl>
                        {
                            {
                                'text': <Input {...field} />,
                                'textarea': <Textarea {...field} />,
                                'date': <Input type="date" {...field} />,
                                'number': <Input type="number" {...field} />
                            }[input.type]
                        }
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
};

export default function GenerateLetterPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.templateId as string;
    
    const [template, setTemplate] = useState<LetterTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Initialize form with empty defaultValues
    const form = useForm({
        defaultValues: {}
    });

    // Reset form defaultValues when template is loaded
    useEffect(() => {
        if (templateId) {
            getTemplateById(templateId)
                .then(response => {
                    setTemplate(response.data);
                    // Prepare default values for form inputs
                    const defaults: Record<string, string> = {};
                    response.data.requiredInputs.forEach((input: { name: string }) => {
                        defaults[input.name] = '';
                    });
                    form.reset(defaults);
                })
                .catch(() => setError("Gagal memuat template atau template tidak ditemukan."))
                .finally(() => setIsLoading(false));
        }
    }, [templateId, form]);
    
    const onSubmit = async (formData: Record<string, unknown>) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const response = await generateLetterFromTemplate({ templateId, formData });
            setSuccess(response.message + ". Anda akan diarahkan kembali.");
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: unknown) {
            type ApiError = {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };
            if (typeof err === "object" && err !== null && "response" in err && typeof (err as ApiError).response === "object") {
                setError((err as ApiError).response?.data?.message || "Gagal mengajukan surat.");
            } else {
                setError("Gagal mengajukan surat.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) return <div>Memuat form...</div>;
    if (error && !template) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Form Pengajuan: {template?.name}</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Isi Data yang Diperlukan</CardTitle>
                    <CardDescription>{template?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {success && <Alert><AlertTitle>Sukses</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            {template?.requiredInputs.map(input => renderFormField(form.control, input))}
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Mengajukan...' : 'Ajukan Surat'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
