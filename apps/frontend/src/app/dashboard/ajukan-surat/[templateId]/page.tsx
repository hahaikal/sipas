'use client';

import { useEffect, useState } from 'react';
import { useForm, Control, FieldValues, ControllerRenderProps } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { LetterTemplate, RequiredInput } from '@sipas/types'; 
import { getTemplateById } from '@/services/templateService';
import { generateLetterFromTemplate } from '@/services/letterService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const renderFormField = (control: Control<FieldValues>, input: RequiredInput) => {
    const renderInput = (field: ControllerRenderProps<FieldValues, string>) => {
        switch (input.type) {
            case 'textarea':
                return <Textarea {...field} />;
            case 'date':
                return <Input type="date" {...field} />;
            case 'number':
                return <Input type="number" {...field} />;
            case 'text':
            default:
                return <Input type="text" {...field} />;
        }
    };

    return (
        <FormField
            key={input.name}
            control={control}
            name={input.name}
            rules={{ required: `${input.label} wajib diisi` }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{input.label}</FormLabel>
                    <FormControl>
                        {renderInput(field)}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default function GenerateLetterPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.templateId as string;
    
    const [template, setTemplate] = useState<LetterTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const form = useForm();

useEffect(() => {
        if (templateId) {
            getTemplateById(templateId)
                .then(response => {
                    if (response && response.data) {
                        setTemplate(response.data);
                    } else {
                        setError("Template data tidak ditemukan.");
                    }
                })
                .catch(() => setError("Gagal memuat template atau template tidak ditemukan."))
                .finally(() => setIsLoading(false));
        }
    }, [templateId]);
    
    const onSubmit = async (formData: FieldValues) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const response = await generateLetterFromTemplate({ templateId, formData });
            setSuccess(response.message + ". Anda akan diarahkan kembali.");
            setTimeout(() => router.push('/dashboard/arsip'), 2000);
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                // @ts-expect-error TS unable to infer error response type
                setError(err.response?.data?.message || "Gagal mengajukan surat.");
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
                    {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {success && <Alert className="mb-4"><AlertTitle>Sukses</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            {Array.isArray(template?.requiredInputs) ? template.requiredInputs.map(input => renderFormField(form.control, input)) : null}
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
