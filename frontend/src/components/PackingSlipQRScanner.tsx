import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserQRCodeReader } from "@zxing/browser";
import { toast } from "react-toastify";
import { PackingSlipItem } from "../types";
import { Camera, X, CheckCircle, Volume2, VolumeX } from "lucide-react";

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
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isStartingRef = useRef(false);

  // Play beep sound on successful scan
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Generate unique ID for items
  const generateItemId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add scanned item to list
  const addScannedItem = useCallback((data: QrData) => {
    // Debounce: prevent duplicate scans within 1.5 seconds
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1500) {
      return;
    }
    lastScanTimeRef.current = now;

    // Visual and audio feedback
    setShowFlash(true);
    playBeep();
    setTimeout(() => setShowFlash(false), 200);

    setItems((prev) => {
      // Check if item already exists
      const existingIndex = prev.findIndex(
        (item) => item.qrCodeId === data.qrCodeId || 
        (item.designNo === data.designNo && item.merchant === data.merchant)
      );

      if (existingIndex !== -1) {
        // Increment quantity for existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          totalPieces: updated[existingIndex].totalPieces + 1,
        };
        
        toast.success(`${data.designNo} → Qty: ${updated[existingIndex].totalPieces}`, { 
          autoClose: 1000,
          hideProgressBar: true 
        });
        
        return updated;
      }

      // Add new item
      const newItem: PackingSlipItem = {
        _tempId: generateItemId(),
        srNo: prev.length + 1,
        merchant: data.merchant,
        productionSampleType: data.productionSampleType,
        designNo: data.designNo,
        qrCodeId: data.qrCodeId,
        totalPieces: 1,
      } as PackingSlipItem;

      toast.success(`${data.designNo} added`, { 
        autoClose: 1000,
        hideProgressBar: true 
      });

      return [...prev, newItem];
    });

    setScanCount(c => c + 1);
    setLastScanned(data.designNo);
  }, [setItems, playBeep]);

  // Fetch sample data from database
  const fetchAndAddSample = useCallback(async (qrText: string) => {
    try {
      let qrData: QrData | null = null;

      // Try JSON format first
      try {
        const parsed = JSON.parse(qrText);
        if (parsed.qrCodeId && parsed.designNo) {
          qrData = {
            merchant: parsed.merchant || '',
            productionSampleType: parsed.productionSampleType || '',
            designNo: parsed.designNo,
            qrCodeId: parsed.qrCodeId
          };
        }
      } catch {
        // Try pipe-separated format: TypeCode|DesignNo|MerchantCode
        const parts = qrText.split('|');
        if (parts.length === 3) {
          const [typeCode, designNo, merchantCode] = parts;
          
          const typeMap: { [key: string]: string } = {
            'HG': 'HANGER',
            'PB': 'PAPER BOOKLET',
            'EB': 'EXPORT BOOKLET',
            'SC': 'SWATCH CARD'
          };

          qrData = {
            merchant: merchantCode,
            productionSampleType: typeMap[typeCode] || typeCode,
            designNo: designNo,
            qrCodeId: `${merchantCode}_${designNo}_${typeCode}`
          };
        }
      }

      if (!qrData) {
        toast.error("Invalid QR format", { autoClose: 1500 });
        return;
      }

      // Try to enrich data from database
      try {
        const response = await fetch(`/api/samples`);
        if (response.ok) {
          const samples = await response.json();
          const sample = samples.find((s: any) => 
            s.qrCodeId === qrData!.qrCodeId ||
            (s.designNo === qrData!.designNo && 
             (s.merchant === qrData!.merchant || 
              s.merchant.toLowerCase().includes(qrData!.merchant.toLowerCase())))
          );
          
          if (sample) {
            qrData = {
              merchant: sample.merchant,
              productionSampleType: sample.productionSampleType,
              designNo: sample.designNo,
              qrCodeId: sample.qrCodeId
            };
          }
        }
      } catch (fetchError) {
        console.log('Could not fetch from database, using QR data');
      }

      addScannedItem(qrData);
    } catch (error) {
      console.error("QR processing error:", error);
      toast.error("Error processing QR", { autoClose: 1500 });
    }
  }, [addScannedItem]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }
    setCameraActive(false);
    isStartingRef.current = false;
  }, []);

  // Start camera and scanning
  const startScanning = useCallback(async () => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current || cameraLoading) {
      return;
    }
    
    // Stop any existing camera first
    stopCamera();
    
    isStartingRef.current = true;
    setCameraLoading(true);
    setCameraError(null);

    try {
      // Check for secure context
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera requires HTTPS');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported');
      }

      // Small delay to ensure video element is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      codeReaderRef.current = new BrowserQRCodeReader();
      
      await codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const qrText = result.getText();
            fetchAndAddSample(qrText);
          }
        }
      );

      setCameraActive(true);
      setCameraLoading(false);
      isStartingRef.current = false;
    } catch (error: any) {
      console.error('Camera error:', error);
      
      let message = 'Camera access failed. ';
      if (error.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        message = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        message = 'Camera is in use by another app.';
      } else if (error.message) {
        message = error.message;
      }
      
      setCameraError(message);
      setCameraLoading(false);
      isStartingRef.current = false;
    }
  }, [cameraLoading, stopCamera, fetchAndAddSample]);

  // Close scanner
  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Calculate total items in list
  const totalItems = items.reduce((sum, item) => sum + item.totalPieces, 0);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ padding: '20px' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl overflow-hidden"
        style={{ width: '380px', maxWidth: '90vw' }}
      >
        {/* Header */}
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Scan Items</h2>
              <p style={{ fontSize: '12px', color: '#bfdbfe', margin: '2px 0 0 0' }}>Point at QR code</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{ padding: '6px', borderRadius: '6px', background: soundEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white' }}
                title={soundEnabled ? 'Sound on' : 'Sound off'}
              >
                {soundEnabled ? <Volume2 style={{ width: '16px', height: '16px' }} /> : <VolumeX style={{ width: '16px', height: '16px' }} />}
              </button>
              <button
                onClick={handleClose}
                style={{ padding: '6px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>{scanCount}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Scans</div>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db' }}></div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>{items.length}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Items</div>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d5db' }}></div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#9333ea' }}>{totalItems}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Qty</div>
          </div>
        </div>

        {/* Camera View */}
        <div style={{ position: 'relative', backgroundColor: '#000', height: '200px' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            autoPlay
            playsInline
            muted
          />
          
          {/* Scan Frame Overlay */}
          {cameraActive && !cameraError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderTopLeftRadius: '4px' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderTopRightRadius: '4px' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderBottomLeftRadius: '4px' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderBottomRightRadius: '4px' }}></div>
                
                {/* Scanning line */}
                <motion.div
                  style={{ position: 'absolute', left: '4px', right: '4px', height: '2px', backgroundColor: '#4ade80' }}
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          )}

          {/* Flash effect */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ position: 'absolute', inset: 0, backgroundColor: '#4ade80', pointerEvents: 'none' }}
              />
            )}
          </AnimatePresence>

          {/* Loading state */}
          {cameraLoading && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid #60a5fa', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
              <p style={{ color: 'white', marginTop: '12px', fontSize: '13px' }}>Starting camera...</p>
            </div>
          )}

          {/* Idle state - camera not started */}
          {!cameraActive && !cameraLoading && !cameraError && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Camera style={{ width: '40px', height: '40px', color: '#6b7280', marginBottom: '8px' }} />
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>Click "Start Camera"</p>
            </div>
          )}

          {/* Error state */}
          {cameraError && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <Camera style={{ width: '36px', height: '36px', color: '#f87171', marginBottom: '8px' }} />
              <p style={{ color: 'white', textAlign: 'center', fontSize: '13px', marginBottom: '12px' }}>{cameraError}</p>
              <button
                onClick={startScanning}
                style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Last scanned indicator */}
          {lastScanned && cameraActive && (
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px' }}>
              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)', color: 'white', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                <span style={{ fontWeight: '500' }}>{lastScanned}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={cameraActive ? stopCamera : startScanning}
              disabled={cameraLoading}
              style={{ 
                flex: 1, 
                padding: '10px', 
                borderRadius: '8px', 
                fontWeight: '500', 
                fontSize: '13px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                border: 'none',
                cursor: cameraLoading ? 'not-allowed' : 'pointer',
                opacity: cameraLoading ? 0.5 : 1,
                backgroundColor: cameraActive ? '#e5e7eb' : '#2563eb',
                color: cameraActive ? '#374151' : 'white'
              }}
            >
              <Camera style={{ width: '16px', height: '16px' }} />
              {cameraLoading ? 'Starting...' : cameraActive ? 'Stop' : 'Start Camera'}
            </button>
            <button
              onClick={handleClose}
              style={{ 
                flex: 1, 
                padding: '10px', 
                borderRadius: '8px', 
                fontWeight: '500', 
                fontSize: '13px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#16a34a',
                color: 'white'
              }}
            >
              <CheckCircle style={{ width: '16px', height: '16px' }} />
              Done ({items.length})
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PackingSlipQRScanner;
