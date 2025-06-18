'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, verifyOtp } from "@/services/authService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok.",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(''); 

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  interface ErrorResponse {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

  const handleRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await register({ ...values, role: 'guru', subdomain: "smaharapanbangsa" });
      setSuccessMessage(data.message);
      setUserEmail(values.email);
      setStep('verify');
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err && typeof (err as ErrorResponse).response === "object") {
        setError((err as ErrorResponse).response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
        setError("Kode OTP harus 6 digit.");
        setIsLoading(false);
        return;
    }
    
    try {
      const data = await verifyOtp(userEmail, finalOtp);
      setSuccessMessage(data.message + " Mengarahkan ke halaman login...");
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      
      if (typeof err === "object" && err !== null && "response" in err && typeof (err as ErrorResponse).response === "object") {
        setError((err as ErrorResponse).response?.data?.message || 'Gagal verifikasi OTP.');
      } else {
        setError('Gagal verifikasi OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-md shadow-lg">
        {step === 'register' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Buat Akun Baru</CardTitle>
              <CardDescription>Isi data di bawah untuk memulai</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegisterSubmit)}>
                <CardContent className="grid gap-3">
                  {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                  <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="nama@sekolah.sch.id" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="phone" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input placeholder="08123456789" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="password" control={form.control} render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="confirmPassword" control={form.control} render={({ field }) => (<FormItem><FormLabel>Konfirmasi Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Memproses...' : 'Lanjutkan'}</Button>
                  <p className="text-sm">Sudah punya akun? <Link href="/login" className="font-semibold text-primary hover:underline">Login di sini</Link></p>
                </CardFooter>
              </form>
            </Form>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={handleOtpSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Verifikasi Akun Anda</CardTitle>
              <CardDescription>Masukkan 6 digit kode OTP yang dikirimkan ke email <strong>{userEmail}</strong></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
               {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
               {successMessage && !error && <Alert><AlertDescription>{successMessage}</AlertDescription></Alert>}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="h-12 w-10 text-center text-lg font-semibold"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Memverifikasi...' : 'Verifikasi & Selesaikan Pendaftaran'}
                </Button>
                <button type="button" className="text-sm text-primary hover:underline" onClick={() => alert('Fungsi kirim ulang OTP belum diimplementasikan.')}>
                    Kirim ulang kode
                </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}