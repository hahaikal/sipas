'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Editor as TinyMCEEditor, Ui } from 'tinymce/tinymce';
import { getSchoolSettings } from '@/services/schoolService';
import { getPlaceholders, createTemplate, updateTemplate, LetterTemplate, Placeholder } from '@/services/templateService';

interface TemplateFormProps {
    initialData?: LetterTemplate | null;
    onSuccess: () => void;
    onMaximizeToggle: (isMaximized: boolean) => void; // <-- Prop baru
}

export default function TemplateForm({ initialData, onSuccess, onMaximizeToggle }: TemplateFormProps) {
    const { register, handleSubmit, control, setValue } = useForm<LetterTemplate>({
        defaultValues: initialData || { name: '', description: '', body: '' }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [letterhead, setLetterhead] = useState({ logoUrl: '', detail: '' });
    const editorRef = useRef<TinyMCEEditor | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settingsRes = await getSchoolSettings();
                setLetterhead({
                    logoUrl: settingsRes.logoUrl ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${settingsRes.logoUrl}` : '',
                    detail: settingsRes.letterheadDetail || ''
                });
            } catch (error) {
                console.error("Failed to fetch dependencies", error);
            }
        };
        fetchData();

        if (initialData) {
            setValue('name', initialData.name);
            setValue('description', initialData.description);
            setValue('body', initialData.body);
        }
    }, [initialData, setValue]);

    const onSubmit = async (data: LetterTemplate) => {
        setIsLoading(true);
        try {
            if (initialData?._id) {
                await updateTemplate(initialData._id, data);
            } else {
                await createTemplate(data);
            }
            onSuccess();
        } catch {
            alert('Gagal menyimpan template.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-96 overflow-hidden">
            {/* Perbaikan: Area konten ini sekarang bisa di-scroll */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Template</Label>
                    <Input id="name" {...register('name', { required: true })} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" {...register('description')} disabled={isLoading} />
                </div>

                <div className="space-y-2">
                    <Label>Preview Kop Surat (Read-only)</Label>
                    <div className="border rounded-md p-4 bg-gray-50 flex items-start gap-4">
                        {letterhead.logoUrl && <img src={letterhead.logoUrl} alt="Logo" className="h-20" />}
                        <div dangerouslySetInnerHTML={{ __html: letterhead.detail }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="body">Isi Surat</Label>
                    <Controller
                        name="body"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Editor
                                id='body'
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                                onInit={(_evt, editor) => editorRef.current = editor}
                                initialValue={value}
                                onEditorChange={(content) => onChange(content)}
                                init={{
                                    height: 500,
                                    menubar: true,
                                    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount fullscreen',
                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | placeholders | fullscreen',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                    setup: (editor: TinyMCEEditor) => {
                                        editor.on('FullscreenStateChanged', (e) => {
                                            onMaximizeToggle(e.state);
                                        });

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
            </div>

            <div className="flex justify-end pt-4 border-t flex-shrink-0">
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Template'}</Button>
            </div>
        </form>
    );
}