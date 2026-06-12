"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarWithName } from "@/components/shared/AvatarWithName";

type FeedbackType = "success" | "late" | "expired" | "error";
type ScanStatus = "tepat_waktu" | "terlambat" | "expired" | "error";

interface ScanFeedbackProps {
  type: FeedbackType;
  employeeName: string;
  time: string;
  status: ScanStatus;
  onDismiss: () => void;
}

const config: Record<
  FeedbackType,
  {
    bg: string;
    text: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  success: {
    bg: "bg-green-500",
    text: "text-white",
    icon: <CheckCircle2 className="w-16 h-16" />,
    label: "Absen Berhasil",
  },
  late: {
    bg: "bg-yellow-500",
    text: "text-white",
    icon: <Clock className="w-16 h-16" />,
    label: "Terlambat",
  },
  expired: {
    bg: "bg-red-600",
    text: "text-white",
    icon: <AlertTriangle className="w-16 h-16" />,
    label: "QR Expired",
  },
  error: {
    bg: "bg-red-600",
    text: "text-white",
    icon: <XCircle className="w-16 h-16" />,
    label: "Gagal",
  },
};

export function ScanFeedback({
  type,
  employeeName,
  time,
  status,
  onDismiss,
}: ScanFeedbackProps) {
  const [visible, setVisible] = useState(true);
  const c = config[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-400",
        c.bg,
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background pulse */}
      <div className="absolute inset-0 bg-white/10 animate-pulse" />

      {/* Icon */}
      <div className={cn("mb-4 relative z-10", c.text)}>{c.icon}</div>

      {/* Employee Name */}
      <h2 className="text-white text-3xl font-bold text-center px-8 mb-2 relative z-10 drop-shadow-lg">
        {employeeName}
      </h2>

      {/* Time */}
      <p className="text-white/90 text-5xl font-bold tabular-nums mb-4 relative z-10 drop-shadow-lg">
        {time}
      </p>

      {/* Status */}
      <p className={cn("text-white/90 text-xl font-medium relative z-10", c.text)}>
        {c.label}
      </p>

      {/* Status badge */}
      <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 relative z-10">
        <p className="text-white font-semibold text-sm uppercase tracking-wider">
          {status === "tepat_waktu"
            ? "Tepat Waktu"
            : status === "terlambat"
            ? "Terlambat"
            : status === "expired"
            ? "QR Expired"
            : "Scan Error"}
        </p>
      </div>
    </div>
  );
}
