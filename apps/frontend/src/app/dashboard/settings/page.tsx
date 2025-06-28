'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { School, getSchoolSettings, updateSchoolSettings, uploadLogo } from '@/services/schoolService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

export default function SettingsPage() {
    const { user } = useAuth();
    const [school, setSchool] = useState<School | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [letterheadDetail, setLetterheadDetail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchoolData = async () => {
            if (!(user as { schoolId?: string })?.schoolId) return;
            try {
                const response = await getSchoolSettings();
                setSchool(response);
                setLetterheadDetail(response.letterheadDetail || '');
                if (response.logoUrl) {
                    // Assuming the service returns a full URL or we construct it
                    // For now, let's assume it's a constructible path
                    setLogoPreview(`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${response.logoUrl}`);
                }
            } catch (err) {
                setError('Gagal memuat pengaturan sekolah.');
                console.error("Gagal memuat pengaturan sekolah:", err);
            }
        };
        fetchSchoolData();
    }, [user]);
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setLogoFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            let logoPublicId = school?.logoUrl;

            if (logoFile) {
                const uploadResponse = await uploadLogo(logoFile);
                logoPublicId = uploadResponse.publicId;
            }

            const payload: Partial<School> = {
                letterheadDetail,
                logoUrl: logoPublicId,
            };

            await updateSchoolSettings(payload);
            setSuccess('Pengaturan berhasil disimpan!');

        } catch {
            setError('Gagal menyimpan pengaturan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pengaturan Sekolah</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Identitas Surat</CardTitle>
                    <CardDescription>Atur logo dan kop surat yang akan tampil pada setiap surat yang dibuat.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {success && <Alert><AlertTitle>Sukses</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo Sekolah</Label>
                        {logoPreview && (
                            <div className="mt-2 w-24 h-24 relative border p-2 rounded-md">
                                <Image src={logoPreview} alt="Logo Preview" layout="fill" objectFit="contain" />
                            </div>
                        )}
                        <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
                        <p className="text-sm text-muted-foreground">Unggah logo baru untuk menggantikan yang lama.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="letterheadDetail">Detail Kop Surat</Label>
                        <Textarea 
                            id="letterheadDetail" 
                            rows={5}
                            value={letterheadDetail}
                            onChange={(e) => setLetterheadDetail(e.target.value)}
                            placeholder="<h1>SMA Harapan Bangsa</h1><p>Jl. Pendidikan No. 123</p>"
                        />
                        <p className="text-sm text-muted-foreground">Gunakan tag HTML sederhana untuk format (contoh: &lt;h1&gt;, &lt;p&gt;, &lt;b&gt;).</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}