"use client";

import { useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { ScanLogEntry } from "./ScanLogEntry";
import type { ScanRecord } from "@/types";

interface ScanLogListProps {
  scans: ScanRecord[];
  highlightNew?: boolean;
}

export function ScanLogList({ scans, highlightNew = false }: ScanLogListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new scan arrives
  useEffect(() => {
    if (containerRef.current && scans.length > 0) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scans[0]?.id]);

  if (scans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Belum ada scan</p>
        <p className="text-gray-400 text-xs mt-1">
          Klik Simulasi Scan untuk memulai
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
    >
      {scans.map((scan, i) => (
        <div
          key={scan.id}
          className="animate-card-in"
          style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
        >
          <ScanLogEntry
            scan={scan}
            highlight={i === 0 && highlightNew}
          />
        </div>
      ))}
    </div>
  );
}
