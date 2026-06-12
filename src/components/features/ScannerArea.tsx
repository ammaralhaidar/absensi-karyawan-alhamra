"use client";

import { QrCode, ScanLine, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScannerAreaProps {
  isScanning: boolean;
  disabled?: boolean;
  onSimulateScan: () => void;
}

export function ScannerArea({
  isScanning,
  disabled = false,
  onSimulateScan,
}: ScannerAreaProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 relative">
      {/* Camera Placeholder */}
      <div
        className={cn(
          "relative w-full max-w-2xl aspect-square max-h-[60vh] md:max-h-[70vh] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500",
          "bg-white border-4",
          isScanning ? "border-secondary/70 shadow-[0_0_40px_rgba(3,153,52,0.2)]" : "border-gray-200 shadow-lg"
        )}
      >
        {/* Scan Lines - vertical scanner */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60 z-20" 
          style={{
            animation: "scan-vertical 2s ease-in-out infinite",
          }}
        />

        {/* Corner Markers */}
        <CornerMarkers isScanning={isScanning} />

        {/* Center Content */}
        {isScanning ? (
          <div className="text-center animate-pulse">
            <ScanLine className={cn(
              "w-16 h-16 mx-auto mb-4 transition-colors duration-500",
              isScanning ? "text-secondary/60" : "text-gray-300"
            )} />
            <p className="text-gray-700 text-lg font-medium">Scanning...</p>
            <p className="text-gray-400 text-sm mt-2">Arahkan QR Code ke area ini</p>
            {/* Scanning dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Dot delay="0ms" />
              <Dot delay="200ms" />
              <Dot delay="400ms" />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <QrCode className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Scanner Siap</p>
            <p className="text-gray-400 text-sm mt-2">
              Klik tombol di bawah untuk simulasi scan
            </p>
          </div>
        )}

        {/* Camera lens effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/5 via-transparent to-black/5 pointer-events-none" />
      </div>

      {/* Simulate Scan Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Button
          size="lg"
          disabled={disabled}
          onClick={onSimulateScan}
          className={cn(
            "px-10 py-7 text-lg font-semibold shadow-xl transition-all duration-300",
            isScanning
              ? "bg-secondary hover:bg-secondary/90 shadow-secondary/30"
              : "bg-primary hover:bg-primary/90 shadow-primary/30",
            disabled && "opacity-50"
          )}
        >
          <ScanLine className="w-6 h-6 mr-3" />
          {isScanning ? "Sedang Scan..." : "Simulasi Scan"}
        </Button>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <div
      className="w-2 h-2 rounded-full bg-secondary/60"
      style={{
        animation: `pulse-dot 1.5s ease-in-out ${delay} infinite`,
      }}
    />
  );
}

function CornerMarkers({ isScanning }: { isScanning: boolean }) {
  const base = "absolute w-12 h-12 transition-colors duration-500";
  const active = isScanning ? "border-secondary" : "border-gray-300";
  return (
    <>
      <div className={cn(base, "top-5 left-5 border-t-4 border-l-4 rounded-tl-lg", active)} />
      <div className={cn(base, "top-5 right-5 border-t-4 border-r-4 rounded-tr-lg", active)} />
      <div className={cn(base, "bottom-5 left-5 border-b-4 border-l-4 rounded-bl-lg", active)} />
      <div className={cn(base, "bottom-5 right-5 border-b-4 border-r-4 rounded-br-lg", active)} />
    </>
  );
}
