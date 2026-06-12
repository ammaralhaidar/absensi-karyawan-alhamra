"use client";

import { useEffect, useState } from "react";
import { QrCode, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  employeeId: string;
  employeeName: string;
  refreshInterval?: number; // in seconds, default 30
  className?: string;
}

export function QRCodeDisplay({
  employeeId,
  employeeName,
  refreshInterval = 30,
  className,
}: QRCodeDisplayProps) {
  const [secondsLeft, setSecondsLeft] = useState(refreshInterval);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch("/api/qr-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, type: "check_in" }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Failed to generate QR");
      }
      const data = await resp.json();
      setToken(data.token);
      setSecondsLeft(refreshInterval);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateToken();
  }, [employeeId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          generateToken();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, employeeId]);

  const progressPercent = (secondsLeft / refreshInterval) * 100;

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-primary flex items-center justify-center gap-2 text-lg">
          <QrCode className="w-6 h-6" />
          QR Code Absensi
        </CardTitle>
        <CardDescription>
          Tunjukkan QR Code ini ke scanner Kiosk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="w-56 h-56 bg-white border-4 border-primary/30 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : error ? (
              <div className="text-center px-4">
                <p className="text-xs text-red-500">{error}</p>
                <button onClick={generateToken} className="text-xs text-primary mt-2 underline">
                  Coba Lagi
                </button>
              </div>
            ) : token ? (
              <QRCodeSVG value={token} size={200} level="H" />
            ) : (
              <div className="text-center select-none">
                <QrCode className="w-28 h-28 text-primary/30 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground px-4">
                  QR Code tidak tersedia
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <RefreshCw className={`w-3.5 h-3.5 ${secondsLeft < 5 ? "animate-spin" : ""}`} />
              Refresh dalam:
            </span>
            <span
              className={`font-bold tabular-nums ${
                secondsLeft <= 5 ? "text-red-500" : "text-primary"
              }`}
            >
              {secondsLeft}s
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={`h-1.5 transition-colors ${
              secondsLeft <= 5 ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
