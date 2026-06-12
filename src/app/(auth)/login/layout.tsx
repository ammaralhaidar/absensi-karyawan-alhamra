import { ReactNode } from "react";
import { Calendar } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Alhamra Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistem Absensi Karyawan</p>
        </div>

        {children}
      </div>
    </div>
  );
}
