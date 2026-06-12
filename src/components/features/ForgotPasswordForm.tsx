"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Masukkan email");
      return;
    }
    
    setIsLoading(true);
    try {
      const resp = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await resp.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        setIsSent(true);
        toast.success("Link reset password telah dikirim ke email Anda");
      }
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-600 font-medium">Email terkirim!</p>
        <p className="text-sm text-slate-500">
          Silakan cek inbox email Anda untuk link reset password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@ibsalhamra.sch.id"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Mengirim..." : "Kirim Link Reset"}
      </Button>
    </form>
  );
}
