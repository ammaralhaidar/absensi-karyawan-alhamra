import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordChangeForm } from "@/components/features/PasswordChangeForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Ubah Password</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ganti Password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  );
}
