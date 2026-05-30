import React, { useState, useRef, useEffect } from "react";
import { Product, User } from "../types";
import { Barcode, CheckCircle, RefreshCw, X, HelpCircle, AudioLines, Sparkles, Plus, Search, ShoppingCart } from "lucide-react";

interface BarcodeScannerProps {
  products: Product[];
  currentUser: User;
  onClose: () => void;
  onScannedAction: (product: Product, scanType: "Intake" | "Checkout") => void;
}

export default function BarcodeScanner({
  products,
  currentUser,
  onClose,
  onScannedAction
}: BarcodeScannerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [typedBarcode, setTypedBarcode] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [isSynthesizedBeep, setIsSynthesizedBeep] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Synthesize beep sound using Web Audio API (cross-browser compatible, zero external dependencies)
  const playBeepSound = () => {
    if (!isSynthesizedBeep) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1050, audioCtx.currentTime); // High frequency scanner beep
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      // Tone length 80ms
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (err) {
      console.warn("Audio Context blocked or not supported on this platform.", err);
    }
  };

  // Turn on actual webcam if permitted (adds extraordinary realism inside browser tabs!)
  const toggleRealCamera = async () => {
    if (cameraActive) {
      stopCamera();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 640, height: 480 }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setTypedBarcode("");
        setScanMessage("Camera view active. Hover a mockup barcode tag to trigger.");
      } catch (err) {
        setScanMessage("Camera permission blocked. Defaulting to high-fidelity touch simulation console.");
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Trigger simulate capture code
  const triggerSimulateScan = (prod: Product) => {
    playBeepSound();
    setSelectedProduct(prod);
    setScanMessage(`CAPTURED: Barcode ${prod.barcode} matched SKU: ${prod.sku}`);
  };

  // Submit manual typing scan code (or test custom barcodes)
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeStr = typedBarcode.trim();
    if (!barcodeStr) return;

    const match = products.find(p => p.barcode === barcodeStr || p.sku.toLowerCase() === barcodeStr.toLowerCase());
    
    if (match) {
      triggerSimulateScan(match);
    } else {
      setScanMessage(`Scan Failed: "${barcodeStr}" did not match any stored SKU registry.`);
      setSelectedProduct(null);
    }
  };

  const isRestricted = currentUser.role === "Sales Agent";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Visual Scanner Camera Display (Left panel) */}
        <div className="p-5 bg-slate-950 flex-1 flex flex-col justify-between items-center relative min-h-[280px] md:min-h-auto border-r border-slate-850">
          <div className="absolute top-3 left-3 flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[9px] font-mono text-rose-500 tracking-wider">INTAKE LASER ACTIVE</span>
          </div>

          <div className="w-full flex justify-between items-center">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">Viewfinder Frame</span>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 font-mono">BEEP:</span>
              <button 
                onClick={() => setIsSynthesizedBeep(!isSynthesizedBeep)}
                className={`py-0.5 px-1 rounded text-[10px] font-mono leading-none ${isSynthesizedBeep ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
              >
                {isSynthesizedBeep ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Central laser animations container */}
          <div className="w-56 h-36 border border-indigo-500/20 rounded-xl relative overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner mt-4">
            
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center p-4">
                <Barcode className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-[10px] text-slate-400 mt-2 font-mono">Camera standby mode</p>
                <button
                  type="button"
                  onClick={toggleRealCamera}
                  className="mt-2.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-[10px] rounded text-indigo-400 font-mono"
                >
                  Mount Real Cam Feed
                </button>
              </div>
            )}

            {/* Glowing animated scanner laser */}
            <div className="absolute left-0 right-0 h-1 bg-rose-500 opacity-80 shadow-md shadow-rose-500 flex justify-center items-center pointer-events-none animate-bounce" style={{ animationDuration: "2.4s" }}></div>
            
            {/* Viewfinder brackets overlay */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-500 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-500 pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-500 pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-500 pointer-events-none"></div>
          </div>

          {/* Text feedback console */}
          <div className="w-full mt-4 p-3 bg-slate-900 border border-slate-850 rounded-xl text-center">
            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">Status Output Panel</span>
            <p className="text-xs font-mono text-slate-300 leading-normal min-h-[36px] flex items-center justify-center">
              {scanMessage || "Awaiting scan trigger code entry..."}
            </p>
          </div>
        </div>

        {/* Scan simulation dashboard (Right panel) */}
        <div className="p-5 flex-1 flex flex-col justify-between max-h-[50vh] md:max-h-none overflow-y-auto">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Simulate Stock Scan Intake</h3>
              <p className="text-[10px] text-slate-500 font-mono">Test and expedite intake metrics</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Select and trigger preloaded barcode buttons */}
          <div className="space-y-3.5 mt-4">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block mb-1.5 uppercase">Touch Simulator (Click to fire scanning)</span>
              
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => triggerSimulateScan(p)}
                    type="button"
                    className="p-2 bg-slate-950 hover:bg-slate-850 hover:border-indigo-500/40 border border-slate-850 text-left rounded-xl transition"
                  >
                    <p className="text-[10px] font-bold text-slate-200 truncate">{p.name}</p>
                    <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-500">
                      <span>{p.sku}</span>
                      <span className="text-indigo-400">{p.barcode.slice(-4)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual field */}
            <form onSubmit={handleManualCodeSubmit} className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono block uppercase">Manual Input String (SKU or Barcode)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typedBarcode}
                  onChange={(e) => setTypedBarcode(e.target.value)}
                  placeholder="e.g. 5012345678901 or EL-LAP-X1"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700"
                >
                  Scan Code
                </button>
              </div>
            </form>

            {/* Actions for matched product */}
            {selectedProduct && (
              <div className="p-3 bg-indigo-500/[0.04] rounded-xl border border-indigo-500/20 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-200">{selectedProduct.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">SKU: {selectedProduct.sku} · Barcode: {selectedProduct.barcode}</p>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    On Hand: {selectedProduct.quantity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {/* EXPEDITE INTAKE */}
                  <button
                    onClick={() => {
                      if (!isRestricted) {
                        onScannedAction(selectedProduct, "Intake");
                        setScanMessage(`Processed Intake for SKU: ${selectedProduct.sku}. +10 Stock level executed.`);
                        setSelectedProduct(null);
                      }
                    }}
                    disabled={isRestricted}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center space-x-1 ${
                      isRestricted 
                        ? "bg-slate-800 text-slate-600 border border-slate-850 cursor-not-allowed" 
                        : "bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 cursor-pointer"
                    }`}
                    title={isRestricted ? "Restricted for Sales Agent" : "Instantly adds 10 to inventory"}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Intake +10 pcs</span>
                  </button>

                  {/* CHECKOUT CART DISPATCH */}
                  <button
                    onClick={() => {
                      onScannedAction(selectedProduct, "Checkout");
                      setScanMessage(`Dispatched SKU: ${selectedProduct.sku} to Checkout Shopping basket!`);
                      setSelectedProduct(null);
                    }}
                    className="py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg font-bold flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Dispatch to Cart</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
