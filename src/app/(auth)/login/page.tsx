"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useSupabase } from "@/lib/supabase/provider";
import { signIn } from "@/lib/auth/actions";
import { toast } from "sonner";
import type { Role } from "@/types";

export default function LoginPage() {
  const { session, isLoading: localLoading } = useAuth();
  const { user, profile, isLoading: supabaseLoading, signOut: supabaseSignOut } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRedirected = useRef(false);

  const isLoading = localLoading || supabaseLoading;

  // Handle automatic redirect when already logged in
  if (!isLoading && !hasRedirected.current) {
    if (user?.id && profile) {
      hasRedirected.current = true;
      const target = getTargetRoute(profile.role);
      router.replace(target);
      return null;
    }
    if (session?.role) {
      hasRedirected.current = true;
      const target = getTargetRoute(session.role);
      router.replace(target);
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Masukkan email dan password");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result?.error) {
        toast.error(result.error);
      }
    } catch {
      // redirect() throws internally in Next.js — this is expected
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#164e7f]" />
      </div>
    );
  }

  // If Supabase user exists but no employee profile
  if (user?.id && !profile && !hasRedirected.current) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#164e7f] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#164e7f]">Alhamra Attendance</CardTitle>
          <CardDescription>Sistem Absensi Karyawan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <p className="text-sm text-red-700 font-medium">
              Akun Anda belum terhubung dengan data karyawan. Silakan hubungi admin.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={async () => {
                await supabaseSignOut();
                window.location.href = "/login";
              }}
            >
              Keluar dari Akun Ini
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-[#164e7f] rounded-xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-[#164e7f]">Alhamra Attendance</CardTitle>
        <CardDescription>
          Sistem Absensi Karyawan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@alhamra.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#164e7f] hover:bg-[#164e7f]/90"
            disabled={isSubmitting}
          >
            <Lock className="w-4 h-4 mr-2" />
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>
        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-[#164e7f] hover:underline">
            Lupa Password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function getTargetRoute(role: Role): string {
  switch (role) {
    case "admin": return "/admin";
    case "kiosk_security": return "/kiosk";
    default: return "/dashboard";
  }
}
