"use client";

import { useEffect, useState, useCallback } from "react";
import { Database, Wifi, WifiOff, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ScanRecord } from "@/types";

interface OfflineQueueProps {
  queue: ScanRecord[];
  isOnline: boolean;
  onSync: () => void;
  onClear: () => void;
}

export function OfflineQueue({
  queue,
  isOnline,
  onSync,
  onClear,
}: OfflineQueueProps) {
  const [syncing, setSyncing] = useState(false);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(() => {
        handleSync();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length]);

  const handleSync = useCallback(() => {
    if (queue.length === 0) return;
    setSyncing(true);
    setTimeout(() => {
      onSync();
      setSyncing(false);
      toast.success("Sinkronisasi berhasil", {
        description: `${queue.length} data scan terkirim ke server`,
      });
    }, 1500);
  }, [queue.length, onSync]);

  if (queue.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl mx-4 mt-3 p-4 space-y-3">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600" />
          <span className="text-amber-800 text-sm font-medium">
            Offline Queue
          </span>
          <Badge className="bg-amber-500 text-white text-[10px]">
            {queue.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {syncing ? (
            <Badge
              variant="outline"
              className="border-amber-300 text-amber-600 text-[10px]"
            >
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Syncing...
            </Badge>
          ) : isOnline ? (
            <Badge
              variant="outline"
              className="border-green-300 text-green-600 text-[10px]"
            >
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-red-300 text-red-600 text-[10px]"
            >
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Pending List */}
      <div className="space-y-1.5">
        {queue.slice(0, 3).map((scan, i) => (
          <div
            key={`q-${i}`}
            className="flex items-center justify-between text-xs bg-amber-100 rounded-lg px-3 py-2"
          >
            <span className="text-amber-900 truncate flex-1">
              {scan.employee_name}
            </span>
            <span className="text-amber-600 tabular-nums ml-2">
              {scan.scanned_at.split("T")[1]?.slice(0, 5)}
            </span>
          </div>
        ))}
        {queue.length > 3 && (
          <p className="text-xs text-amber-600/70 text-center pt-1">
            +{queue.length - 3} scan lainnya
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={syncing || !isOnline}
          onClick={handleSync}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={syncing}
          className="text-xs h-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
