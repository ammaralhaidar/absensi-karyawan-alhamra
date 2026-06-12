"use client";

import { useState, useCallback } from "react";

interface ScanResult {
  success: boolean;
  employee_name: string;
  status: string;
  time: string;
  error?: string;
}

export function useQRScanner() {
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processScan = useCallback(async (token: string): Promise<ScanResult> => {
    setIsProcessing(true);
    try {
      const resp = await fetch("/api/qr-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kiosk_id: "kiosk-1" }),
      });

      const data = await resp.json();
      const result = data.success
        ? {
            success: true,
            employee_name: data.employee_name,
            status: data.status,
            time: data.time,
          }
        : {
            success: false,
            employee_name: "",
            status: "error",
            time: new Date().toLocaleTimeString("id-ID"),
            error: data.error || "Invalid QR",
          };

      setLastScan(result);
      return result;
    } catch (err: any) {
      const result = {
        success: false,
        employee_name: "",
        status: "error",
        time: new Date().toLocaleTimeString("id-ID"),
        error: err.message,
      };
      setLastScan(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processScan, lastScan, isProcessing };
}
