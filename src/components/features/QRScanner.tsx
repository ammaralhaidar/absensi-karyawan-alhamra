"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
          setHasPermission(true);
        } else {
          setHasPermission(false);
          toast.error("Tidak ada kamera yang terdeteksi");
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setHasPermission(false);
        toast.error("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
      });
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // Ignore scan errors (no QR in frame)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Start scanning error:", err);
      toast.error("Gagal memulai scanner");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Stop scanning error:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Kamera Tidak Tersedia</p>
          <p className="text-sm text-slate-500 mt-2">
            Pastikan perangkat memiliki kamera dan izin kamera diberikan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 bg-slate-50 border-b">
        <select
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          className="flex-1 text-sm border rounded px-2 py-1"
        >
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.label}
            </option>
          ))}
        </select>
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={`px-4 py-1 rounded text-sm font-medium ${
            isScanning
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {isScanning ? "Stop" : "Start"}
        </button>
      </div>
      <div className="flex-1 relative">
        <div id="qr-reader" className="w-full h-full" />
        {isScanning && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400" />
          </div>
        )}
      </div>
    </div>
  );
}
