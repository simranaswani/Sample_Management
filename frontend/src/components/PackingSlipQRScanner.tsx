import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { BrowserQRCodeReader } from "@zxing/browser";
import { toast } from "react-toastify";
import { PackingSlipItem } from "../types";
import { Camera, X, CheckCircle } from "lucide-react";

interface QrData {
  merchant: string;
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
          // Sort items alphabetically by merchant name
          const sortedItems = updated.sort((a, b) => {
            const merchantA = a.merchant.toLowerCase();
            const merchantB = b.merchant.toLowerCase();
            return merchantA.localeCompare(merchantB);
          });
          // Update serial numbers after sorting
          const renumberedItems = sortedItems.map((item, i) => ({
            ...item,
            srNo: i + 1
          }));
          toast.success(`'${data.designNo}' count increased`);
          return renumberedItems;
        }
        const newItem: PackingSlipItem = {
          srNo: prev.length + 1,
          merchant: data.merchant,
          productionSampleType: data.productionSampleType,
          designNo: data.designNo,
          qrCodeId: data.qrCodeId,
          totalPieces: 1,
        };
        const updatedItems = [...prev, newItem];
        // Sort items alphabetically by merchant name
        const sortedItems = updatedItems.sort((a, b) => {
          const merchantA = a.merchant.toLowerCase();
          const merchantB = b.merchant.toLowerCase();
          return merchantA.localeCompare(merchantB);
        });
        // Update serial numbers after sorting
        const renumberedItems = sortedItems.map((item, i) => ({
          ...item,
          srNo: i + 1
        }));
        toast.success(`'${data.designNo}' added`);
        return renumberedItems;
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

  const fetchSampleByQrCodeId = useCallback(async (qrCodeId: string, parsedData: any) => {
    try {
      const response = await fetch(`/api/samples`);
      if (response.ok) {
        const samples = await response.json();
        const sample = samples.find((s: any) => s.qrCodeId === qrCodeId);
        if (sample) {
          // Merge the parsed QR data with the database sample data
          const completeData = {
            ...parsedData,
            merchant: sample.merchant,
            productionSampleType: sample.productionSampleType
          };
          setDetectedQrData(completeData);
        } else {
          // If sample not found in database, use the parsed data as is
          setDetectedQrData(parsedData);
        }
      } else {
        // If API call fails, use the parsed data as is
        setDetectedQrData(parsedData);
      }
    } catch (error) {
      console.error('Error fetching sample data:', error);
      // If there's an error, use the parsed data as is
      setDetectedQrData(parsedData);
    }
  }, []);

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
        .decodeFromVideoDevice(undefined, videoRef.current, (result: any, err: any) => {
          if (result) {
            setScanning(false);
            try {
              const parsed = JSON.parse(result.getText());
              if (parsed.qrCodeId && parsed.designNo) {
                // If merchant is missing from QR code, try to fetch it from the database
                if (!parsed.merchant) {
                  fetchSampleByQrCodeId(parsed.qrCodeId, parsed);
                } else {
                  setDetectedQrData(parsed);
                }
              } else {
                toast.error("Invalid QR code", { autoClose: 2000 });
                setTimeout(() => setScanning(true), 2000);
              }
            } catch {
              toast.error("Not valid JSON QR", { autoClose: 2000 });
              setTimeout(() => setScanning(true), 2000);
            }
          }
          if (err) {
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
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       {/* Popup */}
       <motion.div
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         exit={{ scale: 0.9, opacity: 0 }}
         onClick={(e) => e.stopPropagation()}
         className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative"
       >
         {/* Close Button */}
         <button
           onClick={closeAndStop}
           className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
         >
           <X className="w-5 h-5" />
         </button>

         {/* Header */}
         <div className="text-center mb-6">
           <h3 className="text-xl font-bold text-gray-900">
             QR Scanner
           </h3>
         </div>

         {/* Camera */}
         <div className="text-center mb-6">
           <div className="relative bg-black h-64 flex items-center justify-center rounded-lg overflow-hidden">
             <video
               ref={videoRef}
               className={`w-full h-full object-cover ${cameraLoading || cameraError ? "hidden" : ""}`}
             />
              {/* Overlay scanning frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-red-500 rounded-lg w-48 h-48"></div>
              </div>
             {cameraError && <p className="absolute text-red-400">{cameraError}</p>}
             {cameraLoading && (
               <div className="absolute flex flex-col items-center">
                 <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-white text-sm mt-2">Starting camera...</p>
               </div>
             )}
           </div>
         </div>

         {/* Item detected */}
         {detectedQrData && (
           <div className="space-y-3 mb-6">
             <div className="flex items-center gap-2 mb-3">
               <CheckCircle className="w-5 h-5 text-green-600" />
               <span className="font-semibold text-green-800">Item Detected</span>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="font-medium text-gray-700">Design No:</span>
                 <span className="text-gray-900">{detectedQrData.designNo}</span>
               </div>
               <div className="flex justify-between">
                 <span className="font-medium text-gray-700">Merchant:</span>
                 <span className="text-gray-900">{detectedQrData.merchant}</span>
               </div>
               <div className="flex justify-between">
                 <span className="font-medium text-gray-700">Type:</span>
                 <span className="text-gray-900">{detectedQrData.productionSampleType}</span>
               </div>
             </div>
           </div>
         )}

         {/* Footer */}
         <div className="flex justify-center space-x-3">
          {detectedQrData ? (
            <>
              <button
                onClick={handleScanNext}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Rescan
              </button>
              <button
                onClick={handleAddItem}
                disabled={isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isAdding ? "Adding..." : "Add to List"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleScanNext}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                disabled={scanning}
              >
                {scanning ? "Scanning..." : "Scan Item"}
              </button>
              <button
                onClick={() => setScanning(!scanning)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {scanning ? "Stop Camera" : "Start Camera"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PackingSlipQRScanner;
