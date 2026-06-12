"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react";

interface ExportProgressProps {
  onComplete: () => void;
}

export function ExportProgress({ onComplete }: ExportProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + Math.random() * 25 + 5;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [progress, onComplete]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#039934] rounded-full transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums text-slate-500 w-10 text-right">
        {Math.min(Math.round(progress), 100)}%
      </span>
      {progress >= 100 && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
    </div>
  );
}
