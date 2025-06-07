'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- HOOKS ---
  const router = useRouter();
  const { login: setAuthSession } = useAuth(); // Menggunakan alias agar tidak bentrok nama

  // --- HANDLER ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { token, user } = await login(email, password);
      
      // Simpan sesi ke context
      setAuthSession(token, user);
      
      // Arahkan ke dashboard setelah login berhasil
      router.push('/dashboard');

    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        errorMessage = (err.response.data as { message?: string }).message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login SIPAS</CardTitle>
            <CardDescription>
              Masuk untuk mengelola arsip sekolah Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* --- ERROR ALERT --- */}
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Login Gagal</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@sekolah.sch.id"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>
            <p className="mt-4 text-xs text-center text-gray-700">
              Belum punya akun?{" "}
              <Link href="/register" className=" text-blue-600 hover:underline">
                Daftar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}