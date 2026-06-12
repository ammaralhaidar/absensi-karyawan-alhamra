"use client";

import { useState, useCallback, useEffect } from "react";
import { QRScanner } from "@/components/features/QRScanner";
import { ScanFeedback } from "@/components/features/ScanFeedback";
import { ScanLogList } from "@/components/features/ScanLogList";
import { OfflineQueue } from "@/components/features/OfflineQueue";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { useQRScanner } from "@/hooks/useQRScanner";
import { useScanRecords } from "@/hooks/useData";
import { toast } from "sonner";
import type { ScanRecord } from "@/types";

type FeedbackState = {
  type: "success" | "late" | "expired" | "error";
  employeeName: string;
  time: string;
  status: ScanRecord["status"];
} | null;

let scanIdCounter = 100;

export default function KioskPage() {
  const { data: scanRecordsData, loading: scanRecordsLoading } = useScanRecords();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<ScanRecord[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isOffline, setIsOffline] = useState(false);
  const { processScan } = useQRScanner();
  const { playSuccess, playLate, playError } = useAudioFeedback();

  useEffect(() => {
    const handleOnline = async () => {
      toast.info("Koneksi pulih, menyinkronkan data...");
      const { syncOfflineData } = await import("@/lib/offline/sync");
      const result = await syncOfflineData();
      if (result.synced > 0) {
        toast.success(`${result.synced} data berhasil disinkronkan`);
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_DATA' });
        }
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (scanRecordsData.length > 0) {
      setScans(scanRecordsData.slice(0, 5));
    }
  }, [scanRecordsData]);

  const handleScan = useCallback(async (token: string) => {
    const result = await processScan(token);

    const scanStatus: ScanRecord["status"] =
      result.status === "tepat_waktu"
        ? "tepat_waktu"
        : result.status === "terlambat"
        ? "terlambat"
        : "error";

    const feedbackType: "success" | "late" | "expired" | "error" =
      scanStatus === "tepat_waktu"
        ? "success"
        : scanStatus === "terlambat"
        ? "late"
        : "error";

    if (scanStatus === "tepat_waktu") {
      playSuccess();
    } else if (scanStatus === "terlambat") {
      playLate();
    } else {
      playError();
    }

    const scanRecord: ScanRecord = {
      id: `scan-${scanIdCounter++}`,
      employee_name: result.employee_name || "Unknown",
      scanned_at: new Date().toISOString(),
      status: scanStatus,
      type: "check_in",
    };

    setFeedback({
      type: feedbackType,
      employeeName: result.employee_name || "Unknown",
      time: result.time,
      status: scanStatus,
    });

    if (isOffline) {
      setOfflineQueue((prev) => [scanRecord, ...prev]);
      const { addToQueue } = await import("@/lib/offline/sync");
      await addToQueue({ token, kiosk_id: "kiosk-1" });
      toast.info("Disimpan offline", {
        description: "Data akan sync saat koneksi pulih",
      });
    } else {
      setScans((prev) => [scanRecord, ...prev].slice(0, 5));
    }
  }, [processScan, playSuccess, playLate, playError, isOffline]);

  const handleSync = useCallback(() => {
    setScans((prev) => [...offlineQueue, ...prev].slice(0, 5));
    setOfflineQueue([]);
  }, [offlineQueue]);

  const handleClear = useCallback(() => {
    setOfflineQueue([]);
    toast.info("Queue dibersihkan");
  }, []);

  const handleToggleOnline = useCallback(() => {
    setIsOffline((prev) => {
      const newOffline = !prev;
      toast(newOffline ? "Mode Offline aktif" : "Mode Online aktif", {
        description: newOffline
          ? "Scan disimpan lokal (IndexedDB simulation)"
          : "Data akan otomatis sync",
      });
      return newOffline;
    });
  }, []);

  const handleDismissFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full relative">
      {/* Scan Feedback Overlay */}
      {feedback && (
        <ScanFeedback
          type={feedback.type}
          employeeName={feedback.employeeName}
          time={feedback.time}
          status={feedback.status}
          onDismiss={handleDismissFeedback}
        />
      )}

      {/* Main Scanner */}
      <div className="flex-1 flex flex-col min-h-0">
        <QRScanner onScan={handleScan} />
      </div>

      {/* Sidebar - right on desktop, bottom on mobile */}
      <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col shrink-0 max-h-[40vh] md:max-h-none">
        {/* Offline Toggle */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={handleToggleOnline}
            className={`w-full rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              isOffline
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {isOffline
              ? "📴 Mode Offline — Simpan Lokal"
              : "🟢 Mode Online — Sync Otomatis"}
          </button>
        </div>

        {/* Offline Queue */}
        <OfflineQueue
          queue={offlineQueue}
          isOnline={!isOffline}
          onSync={handleSync}
          onClear={handleClear}
        />

        {/* Scan Log */}
        <ScanLogList
          scans={scans}
          highlightNew={!!feedback}
        />
      </div>
    </div>
  );
}
