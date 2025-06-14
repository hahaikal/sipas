'use client';

import { useEffect, useState } from 'react';
import { Achievement, getAllAchievements, createAchievement, deleteAchievement, AchievementData } from '@/services/achievementService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

export default function ManageAchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<AchievementData>({
        title: '', description: '', year: new Date().getFullYear(), level: 'Sekolah', achievedBy: ''
    });

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAchievements();
            setAchievements(response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await createAchievement(formData);
            setIsFormOpen(false);
            fetchAchievements();
        } catch {
            alert('Gagal menyimpan pencapaian.');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Anda yakin ingin menghapus pencapaian ini?')) {
            await deleteAchievement(id);
            fetchAchievements();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manajemen Pencapaian</h1>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Tambah Pencapaian</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Tambah Pencapaian Baru</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label>Judul Prestasi</Label><Input name="title" onChange={handleInputChange} required /></div>
                            <div><Label>Diraih oleh</Label><Input name="achievedBy" onChange={handleInputChange} required /></div>
                            <div><Label>Deskripsi</Label><Textarea name="description" onChange={handleInputChange} required /></div>
                            <div><Label>Tahun</Label><Input name="year" type="number" onChange={handleInputChange} required /></div>
                            <div><Label>Tingkat</Label>
                                <Select name="level" onValueChange={(value) => setFormData({...formData, level: value as any})}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sekolah">Sekolah</SelectItem>
                                        <SelectItem value="Kecamatan">Kecamatan</SelectItem>
                                        <SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem>
                                        <SelectItem value="Provinsi">Provinsi</SelectItem>
                                        <SelectItem value="Nasional">Nasional</SelectItem>
                                        <SelectItem value="Internasional">Internasional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end"><Button type="submit">Simpan</Button></div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader><CardTitle>Daftar Prestasi & Pencapaian</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? <p>Memuat...</p> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Judul</TableHead><TableHead>Tingkat</TableHead><TableHead>Tahun</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {achievements.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>{item.level}</TableCell>
                                        <TableCell>{item.year}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}