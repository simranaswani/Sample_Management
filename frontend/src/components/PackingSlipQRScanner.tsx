import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserQRCodeReader, NotFoundException } from "@zxing/library";
import { toast } from "react-toastify";
import { PackingSlipItem } from "../types";
import { Camera, X, CheckCircle } from "lucide-react";

interface QrData {
  productionSampleType: string;
  designNo: string;
  qrCodeId: string;
}

interface PackingSlipQRScannerProps {
  items: PackingSlipItem[];
  setItems: React.Dispatch<React.SetStateAction<PackingSlipItem[]>>;
  onClose: () => void;
}

const PackingSlipQRScanner: React.FC<PackingSlipQRScannerProps> = ({ items, setItems, onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [detectedQrData, setDetectedQrData] = useState<QrData | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserQRCodeReader | null>(null);

  // --- Fix: Ensure increments by 1 only ---
  const addDetectedToItems = useCallback(
    (data: QrData) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.qrCodeId === data.qrCodeId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            totalPieces: updated[existingIndex].totalPieces + 1,
          };
          toast.success(`'${data.designNo}' count increased`);
          return updated;
        }
        const newItem: PackingSlipItem = {
          srNo: prev.length + 1,
          merchant: "Scanned Item",
          productionSampleType: data.productionSampleType,
          designNo: data.designNo,
          qrCodeId: data.qrCodeId,
          totalPieces: 1,
        };
        toast.success(`'${data.designNo}' added`);
        return [...prev, newItem];
      });
    },
    [setItems]
  );

  const handleAddItem = () => {
    if (detectedQrData && !isAdding) {
      setIsAdding(true);
      addDetectedToItems(detectedQrData);
      setDetectedQrData(null);
      setScanning(true);
      setTimeout(() => setIsAdding(false), 400);
    }
  };

  const handleScanNext = () => {
    setDetectedQrData(null);
    setScanning(true);
  };

  const closeAndStop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    codeReader.current = null;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (scanning && videoRef.current) {
      setCameraLoading(true);
      setCameraError(null);

      codeReader.current = new BrowserQRCodeReader();

      codeReader.current
        .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            setScanning(false);
            try {
              const parsed = JSON.parse(result.getText());
              if (parsed.qrCodeId && parsed.designNo) {
                setDetectedQrData(parsed);
              } else {
                toast.error("Invalid QR code", { autoClose: 2000 });
                setTimeout(() => setScanning(true), 2000);
              }
            } catch {
              toast.error("Not valid JSON QR", { autoClose: 2000 });
              setTimeout(() => setScanning(true), 2000);
            }
          }
          if (err && !(err instanceof NotFoundException)) {
            setCameraError("Could not scan QR code.");
          }
        })
        .then(() => setCameraLoading(false))
        .catch(() => {
          setCameraError("Failed to access camera");
          setCameraLoading(false);
        });

      return () => {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        codeReader.current = null;
      };
    }
  }, [scanning]);

  return (
     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       {/* Popup */}
       <div
         className="
           bg-white rounded-2xl shadow-2xl 
           w-96 max-w-md
           flex flex-col
           overflow-hidden
         "
       >
         {/* Header */}
         <div className="flex items-center justify-between px-7 py-4 border-b bg-gray-50">
           <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800">
             <Camera className="w-5 h-5 text-blue-600" /> QR Scanner
           </h2>
           <button
             onClick={closeAndStop}
             className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600"
           >
             <X className="w-5 h-5" />
           </button>
         </div>

         {/* Camera */}
         <div className="relative bg-black h-80 flex items-center justify-center">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraLoading || cameraError ? "hidden" : ""}`}
          />
           {/* Overlay scanning frame */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="border-4 border-red-500 rounded-lg w-64 h-64"></div>
           </div>
          {cameraError && <p className="absolute text-red-400">{cameraError}</p>}
          {cameraLoading && (
            <div className="absolute flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white text-sm mt-2">Starting camera...</p>
            </div>
          )}
        </div>

         {/* Item detected */}
         {detectedQrData && (
           <div className="p-6 bg-green-50 border-t border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800 text-sm">Item Detected</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Design No:</span> {detectedQrData.designNo}</p>
              <p><span className="font-medium">Type:</span> {detectedQrData.productionSampleType}</p>
            </div>
          </div>
        )}

         {/* Footer */}
         <div className="p-6 border-t bg-gray-50 flex gap-4">
          {detectedQrData ? (
            <>
              <button
                onClick={handleScanNext}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
              >
                Scan Next
              </button>
              <button
                onClick={handleAddItem}
                disabled={isAdding}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                {isAdding ? "Adding..." : "Add to List"}
              </button>
            </>
          ) : (
            <button
              onClick={handleScanNext}
              className="w-full px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-sm font-medium"
              disabled={scanning}
            >
              {scanning ? "Scanning..." : "Scan Item"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackingSlipQRScanner;
