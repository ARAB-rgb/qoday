import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, Play, Square, AlertCircle } from 'lucide-react';

interface CameraScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Play a quick satisfying beep sound upon successful barcode scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch beep (A5)
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15); // fade out
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      console.warn('Audio context failed to play beep:', err);
    }
  };

  useEffect(() => {
    // Standard setup for HTML5 QR code scanner
    const scannerId = 'reader';
    
    // We target common barcode types: EAN-13, EAN-8, UPC-A, UPC-E, CODE-128, QR
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.QR_CODE
    ];

    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 15,
        qrbox: { width: 250, height: 130 }, // Widescreen format suitable for typical barcodes
        aspectRatio: 1.777778, // 16:9
        formatsToSupport: formatsToSupport,
        rememberLastUsedCamera: true,
        supportedScanTypes: [] // standard defaults
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    const onScan = (decodedText: string) => {
      playBeep();
      onScanSuccess(decodedText);
      // Automatically close or pause after successful scan
      scanner.clear().then(() => {
        onClose();
      }).catch(err => {
        console.error('Error stopping scanner:', err);
        onClose();
      });
    };

    const onError = (err: any) => {
      // The library logs scan failures frequently when searching, so we don't display warnings unless critical
    };

    scanner.render(onScan, onError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.warn('Failed to clear scanner on unmount:', err);
        });
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-slate-200">قارئ باركود الكاميرا المباشر</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-indigo-950/40 border-b border-indigo-900/30 px-4 py-2.5 text-xs text-indigo-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>وجه الكاميرا نحو الرمز الشريطي (الباركود) الموجود على السلعة لتمسحه تلقائياً.</span>
        </div>

        {/* Scanner Canvas Container */}
        <div className="relative p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {/* Laser guide lines */}
          <div className="absolute inset-x-8 top-[38%] bottom-[38%] border border-indigo-500/35 pointer-events-none rounded z-10 overflow-hidden">
            {/* Animated Laser beam */}
            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce" style={{ animationDuration: '2.5s' }}></div>
          </div>

          <div id="reader" className="w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800"></div>

          {error && (
            <div className="mt-4 p-3 bg-rose-950/50 border border-rose-900/40 text-rose-300 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>يدعم باركود السلع (EAN-13) والـ QR Code</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
