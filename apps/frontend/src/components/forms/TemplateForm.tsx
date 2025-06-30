// hahaikal/sipas/sipas-3ee11711986d6987047acd028ef503439b3f38d2/apps/frontend/src/components/forms/TemplateForm.tsx (FIXED)
'use client';

import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Editor as TinyMCEEditor, Ui } from 'tinymce/tinymce';
import { getPlaceholders } from '@/services/templateService';
import { LetterTemplate, Placeholder } from '@sipas/types';

interface TemplateFormProps {
    initialData?: Partial<LetterTemplate> | null;
    onSubmit: (data: Omit<LetterTemplate, '_id' | 'schoolId'>) => void;
    isLoading?: boolean;
}

export default function TemplateForm({ initialData, onSubmit, isLoading = false }: TemplateFormProps) {
    const { register, handleSubmit, control, setValue } = useForm<Omit<LetterTemplate, '_id' | 'schoolId'>>({
        defaultValues: initialData || { name: '', description: '', body: '' }
    });
    const editorRef = useRef<TinyMCEEditor | null>(null);

    useEffect(() => {
        if (initialData) {
            setValue('name', initialData.name || '');
            setValue('description', initialData.description || '');
            setValue('body', initialData.body || '');
        }
    }, [initialData, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Template</Label>
                <Input id="name" {...register('name', { required: true })} disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" {...register('description')} disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="body">Isi Surat</Label>
                <Controller
                    name="body"
                    control={control}
                    render={({ field }) => (
                        <Editor
                            id='body'
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                            onInit={(_evt, editor) => editorRef.current = editor}
                            initialValue={field.value}
                            onEditorChange={(content) => field.onChange(content)}
                            disabled={isLoading}
                            init={{
                                height: 500,
                                menubar: true,
                                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | placeholders',
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                setup: (editor: TinyMCEEditor) => {
                                    editor.ui.registry.addMenuButton('placeholders', {
                                        text: 'Sisipkan Placeholder',
                                        fetch: async (callback) => {
                                            const placeholders = await getPlaceholders();
                                            const items: Ui.Menu.MenuItemSpec[] = placeholders.map((p: Placeholder) => ({
                                                type: 'menuitem',
                                                text: p.text,
                                                onAction: () => editor.insertContent(p.value),
                                            }));
                                            callback(items);
                                        },
                                    });
                                }
                            }}
                        />
                    )}
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Template'}</Button>
            </div>
        </form>
    );
}