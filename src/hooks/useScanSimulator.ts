"use client";

import { useState, useCallback, useRef } from "react";
import { employees } from "@/lib/dummy-data";
import type { ScanRecord } from "@/types";

interface ScanResult {
  scan: ScanRecord;
  timestamp: string;
}

export function useScanSimulator() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const counter = useRef(100);

  const scan = useCallback((): Promise<ScanResult> => {
    setIsScanning(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsScanning(false);

        const rand = Math.random();
        const status: ScanRecord["status"] =
          rand < 0.45
            ? "tepat_waktu"
            : rand < 0.7
            ? "terlambat"
            : rand < 0.85
            ? "expired"
            : "error";

        const member = employees[Math.floor(Math.random() * employees.length)];

        const now = new Date();
        const timestamp = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const result: ScanResult = {
          scan: {
            id: `scan-${counter.current++}`,
            employee_name: member.name,
            avatar_url: member.avatar_url,
            scanned_at: now.toISOString(),
            status,
            type: Math.random() > 0.5 ? "check_in" : "check_out",
          },
          timestamp,
        };

        setLastResult(result);
        resolve(result);
      }, 1200);
    });
  }, []);

  return { scan, isScanning, lastResult };
}
