'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, verifyOtp } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'guru',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await register(formData);
      setSuccessMessage(data.message);
      setStep('verify');
    } catch (err: unknown) {
      let errorMessage = 'Gagal mendaftar. Silakan coba lagi.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        errorMessage = (err.response as { data?: { message?: string } }).data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await verifyOtp(formData.email, otp);
      setSuccessMessage(data.message + " Mengarahkan ke halaman login...");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      let errorMessage = 'Gagal verifikasi OTP. Silakan coba lagi.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        errorMessage = (err.response as { data?: { message?: string } }).data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {step === 'register' && (
        <form onSubmit={handleRegisterSubmit}>
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Daftar Akun SIPAS</CardTitle>
              <CardDescription>Buat akun baru untuk sekolah Anda</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={formData.name} onChange={handleInputChange} required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Daftar & Kirim OTP'}
              </Button>
               <p className="mt-4 text-xs text-center text-gray-700">
                Sudah punya akun?{" "}
                <Link href="/login" className=" text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </form>
      )}

      {step === 'verify' && (
         <form onSubmit={handleOtpSubmit}>
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Verifikasi OTP</CardTitle>
              <CardDescription>Masukkan kode 6 digit yang dikirim ke email <strong>{formData.email}</strong></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              {successMessage && <Alert><AlertTitle>Info</AlertTitle><AlertDescription>{successMessage}</AlertDescription></Alert>}
               <div className="grid gap-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={isLoading} maxLength={6} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Memverifikasi...' : 'Verifikasi & Selesaikan Pendaftaran'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}