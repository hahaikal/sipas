'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl } from '@/components/ui/form';
import type { Editor as TinyMCEEditor, Ui } from 'tinymce/tinymce';
import { getSchoolSettings } from '@/services/schoolService';
import { getPlaceholders, createTemplate, updateTemplate, LetterTemplate, Placeholder } from '@/services/templateService';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

interface TemplateFormProps {
    initialData?: LetterTemplate | null;
    onSuccess: () => void;
}

export default function TemplateForm({ initialData, onSuccess }: TemplateFormProps) {
    const form = useForm<LetterTemplate>({
        defaultValues: initialData || {
            name: '',
            description: '',
            body: '',
            requiredInputs: []
        }
    });

    const { register, control, handleSubmit, setValue } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "requiredInputs"
    });

    const [isLoading, setIsLoading] = useState(false);
    const [letterhead, setLetterhead] = useState({ logoUrl: '', detail: '' });
    const editorRef = useRef<TinyMCEEditor | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settingsRes = await getSchoolSettings();
                setLetterhead({
                    logoUrl: settingsRes.data.logoUrl ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${settingsRes.data.logoUrl}` : '',
                    detail: settingsRes.data.letterheadDetail || ''
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
            setValue('requiredInputs', initialData.requiredInputs);
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
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="border rounded-md p-4 bg-gray-50 flex items-start gap-4 min-h-[100px]">
                    {letterhead.logoUrl && <Image src={letterhead.logoUrl} alt="Logo" height={96} width={96} />}
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

                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Input Tambahan yang Diperlukan</h3>
                            <p className="text-sm text-muted-foreground">Definisikan field yang perlu diisi manual oleh guru.</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ name: '', label: '', type: 'text' })}
                        >
                            Tambah Input
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                                <Input
                                    {...register(`requiredInputs.${index}.name`)}
                                    placeholder="name (cth: nama_kegiatan)"
                                    className="col-span-3"
                                />
                                <Input
                                    {...register(`requiredInputs.${index}.label`)}
                                    placeholder="Label (cth: Nama Kegiatan)"
                                    className="col-span-4"
                                />
                                <Controller
                                    control={control}
                                    name={`requiredInputs.${index}.type`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="col-span-4">
                                                    <SelectValue placeholder="Tipe Input" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="col-span-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Template'}</Button>
                </div>
            </form>
        </Form>
    );
}