import React, { useEffect, useRef } from "react";
import { Encoder, Byte } from "@nuintun/qrcode";

interface MicroQRProps {
  value: string;
  size?: number;
  id?: string;
}

const MicroQRCode: React.FC<MicroQRProps> = ({ value, size = 200, id }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const encoder = new Encoder({
      level: 'L' // lowest error correction level
    });

    const qrcode = encoder.encode(new Byte(value));

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, size, size);
        
        // Get the QR code data URL and draw it
        const dataURL = qrcode.toDataURL(size / qrcode.size);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size);
        };
        img.src = dataURL;
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} id={id} width={size} height={size} />;
};

export default MicroQRCode;
