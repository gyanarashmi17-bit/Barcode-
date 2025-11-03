import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const Scanner = ({ onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  // Start camera scanner
  const startScanner = () => {
    if (scannerRef.current) {
      setScanning(true);
      const html5QrCode = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
        },
        false
      );

      html5QrCode.render(
        (decodedText) => {
          onScanSuccess(decodedText); // Send barcode result to parent
          stopScanner(html5QrCode);
        },
        (errorMessage) => {
          console.log("Scanning error:", errorMessage);
        }
      );

      scannerRef.current = html5QrCode;
    }
  };

  // Stop scanner and clear camera feed
  const stopScanner = (scannerInstance) => {
    if (scannerInstance) {
      scannerInstance.clear().catch((err) => console.log("Stop error:", err));
      setScanning(false);
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {!scanning ? (
        <button
          onClick={startScanner}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"
        >
          📸 Scan Barcode
        </button>
      ) : (
        <div id="reader" className="w-full max-w-md mt-4"></div>
      )}
    </div>
  );
};

export default Scanner;
