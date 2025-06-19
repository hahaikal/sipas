'use client';

import { useEffect, useState } from 'react';
import { GalleryItem, getAllGalleryItems, createGalleryItem, deleteGalleryItem } from '@/services/galleryService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function ManageGalleryPage() {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchGalleryItems();
    }, []);

    const fetchGalleryItems = async () => {
        setIsLoading(true);
        try {
            const response = await getAllGalleryItems();
            setGalleryItems(response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !caption) {
            alert('Caption dan file gambar harus diisi.');
            return;
        }
        setIsUploading(true);
        try {
            await createGalleryItem({ caption, image: file });
            setCaption('');
            setFile(null);
            (document.getElementById('image-upload') as HTMLInputElement).value = '';
            await fetchGalleryItems();
        } catch {
            alert('Gagal mengunggah gambar.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Anda yakin ingin menghapus gambar ini?')) {
            try {
                await deleteGalleryItem(id);
                await fetchGalleryItems();
            } catch {
                alert('Gagal menghapus gambar.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manajemen Galeri</h1>

            <Card>
                <CardHeader><CardTitle>Unggah Gambar Baru</CardTitle></CardHeader>
                <form onSubmit={handleUploadSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="caption">Caption Gambar</Label>
                            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} required disabled={isUploading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-upload">File Gambar</Label>
                            <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" required disabled={isUploading} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? 'Mengunggah...' : 'Unggah ke Galeri'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader><CardTitle>Daftar Gambar di Galeri</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? <p>Memuat...</p> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryItems.map(item => {
                                const imageSrc = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '').replace(/\/$/, '')}${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}`;
                                console.log('Gallery image src:', imageSrc);
                                return (
                                    <div key={item._id} className="relative group border rounded-lg overflow-hidden aspect-square">
                                        <Image 
                                            src={item.imageUrl}
                                            alt={item.caption}
                                            width={300}
                                            height={300}
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col justify-between p-2">
                                            <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity break-words">{item.caption}</p>
                                            <Button 
                                                variant="destructive" size="icon" 
                                                className="self-end opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                                onClick={() => handleDelete(item._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}