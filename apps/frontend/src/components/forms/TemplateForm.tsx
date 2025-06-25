'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

import { getPlaceholders } from '@/services/placeholderService';
import { Placeholder, LetterTemplate } from '@sipas/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '../ui/textarea';

const templateFormSchema = z.object({
  name: z.string().min(3, 'Nama template wajib diisi.'),
  description: z.string().optional(),
  body: z.string().min(10, 'Isi template tidak boleh kosong.'),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  onSubmit: (data: TemplateFormData) => void;
  initialData?: LetterTemplate | null;
  isLoading?: boolean;
}

interface TinyMCEMenuItem {
  type: 'menuitem';
  text: string;
  onAction: () => void;
}

export default function TemplateForm({ onSubmit, initialData, isLoading = false }: TemplateFormProps) {
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      body: initialData?.body || '',
    },
  });

  const nameRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPlaceholders().then(setPlaceholders).catch(console.error);
  }, []);

  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      if (errors.name) {
        nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.description) {
        descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.body) {
        bodyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [form.formState.errors]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem ref={nameRef}>
              <FormLabel>Nama Template</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem ref={descriptionRef}>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div ref={bodyRef}>
          <FormLabel>Isi Surat</FormLabel>
          <Controller
            name="body"
            control={form.control}
            render={({ field }) => (
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                value={field.value}
                onEditorChange={field.onChange}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'wordcount',
                  ],
                  toolbar:
                    'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | placeholderButton | help',

                  setup: (editor: TinyMCEEditor) => {
                    editor.ui.registry.addMenuButton('placeholderButton', {
                      text: 'Sisipkan Placeholder',
                      // --- PERBAIKAN: Gunakan tipe TinyMCEMenuItem[] ---
                      fetch: (callback: (items: TinyMCEMenuItem[]) => void) => {
                        const items: TinyMCEMenuItem[] = placeholders.map((p) => ({
                          type: 'menuitem',
                          text: p.description,
                          onAction: () => {
                            editor.insertContent(p.key);
                          },
                        }));
                        callback(items);
                      },
                    });
                  },
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                }}
              />
            )}
          />
          <FormMessage>{form.formState.errors.body?.message}</FormMessage>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
