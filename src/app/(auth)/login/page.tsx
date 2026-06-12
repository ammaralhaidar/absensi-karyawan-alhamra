"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Lock, Users, ScanLine, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useSupabase } from "@/lib/supabase/provider";
import { signIn } from "@/lib/auth/actions";
import { employees } from "@/lib/dummy-data";
import { toast } from "sonner";

export default function LoginPage() {
  const { session, login, isLoading: localLoading, logout } = useAuth();
  const { user, isLoading: supabaseLoading, profile } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const hasRedirected = useRef(false);

  const isLoading = localLoading || supabaseLoading;

  useEffect(() => {
    if (isLoading) return;
    if (hasRedirected.current) return;
    
    // Check for localStorage session first
    if (session?.role) {
      hasRedirected.current = true;
      if (session.role === "admin") router.push("/admin");
      else if (session.role === "kiosk_security") router.push("/kiosk");
      else router.push("/dashboard");
      return;
    }
    
    // For Supabase auth, check if user has employee profile
    if (user?.id) {
      if (!profile) {
        // User exists in Auth but not in employees table
        setAuthError("Akun Anda belum terhubung dengan data karyawan. Silakan hubungi admin.");
        return;
      }
      hasRedirected.current = true;
      if (profile.role === "admin") router.push("/admin");
      else if (profile.role === "kiosk_security") router.push("/kiosk");
      else router.push("/dashboard");
    }
  }, [session, user, profile, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Masukkan email dan password");
      return;
    }
    setIsSubmitting(true);
    const result = await signIn(email, password);
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: "employee" | "admin" | "kiosk_security") => {
    const emp = employees.find(e => e.role === role);
    login(role, emp?.id, emp?.name, emp?.department_id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#164e7f]" />
      </div>
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
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
            <p className="text-sm text-red-700 font-medium">{authError}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              Keluar dari Akun Ini
            </Button>
          </div>
        )}
        <p className="text-center text-sm text-slate-500">
          Demo Mode — Login langsung sebagai:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="text-xs flex flex-col items-center py-3 h-auto" onClick={() => handleDemoLogin("employee")}>
            <Users className="w-4 h-4 mb-1 text-[#164e7f]" />
            Karyawan
            <span className="text-[9px] text-slate-400">Ahmad Fauzi</span>
          </Button>
          <Button variant="outline" className="text-xs flex flex-col items-center py-3 h-auto" onClick={() => handleDemoLogin("kiosk_security")}>
            <ScanLine className="w-4 h-4 mb-1 text-[#039934]" />
            Security
            <span className="text-[9px] text-slate-400">Hadi Wijaya</span>
          </Button>
          <Button variant="outline" className="text-xs flex flex-col items-center py-3 h-auto" onClick={() => handleDemoLogin("admin")}>
            <Shield className="w-4 h-4 mb-1 text-amber-600" />
            Admin
            <span className="text-[9px] text-slate-400">Eka Wulandari</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
