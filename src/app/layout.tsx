import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { SupabaseProvider } from "@/lib/supabase/provider";
import { ServiceWorker } from "@/components/ServiceWorker";
import { PWAInstallPrompt } from "@/components/features/PWAInstallPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Alhamra Attendance PWA",
  description: "Sistem absensi karyawan Alhamra - Offline-first PWA dengan QR Code Scanner",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <SupabaseProvider>
          <AuthProvider>
            {children}
            <ServiceWorker />
            <PWAInstallPrompt />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
