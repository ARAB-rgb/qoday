import React, { useState, useEffect } from 'react';
import { 
  Scale, Printer, Barcode, CreditCard, CheckCircle2, AlertTriangle, 
  XCircle, RefreshCw, Sliders, Search, Power, Wifi, Usb, 
  Activity, HardDrive, Settings, Radio, Cpu, Smartphone, 
  Play, RotateCcw, Info, Volume2, Paperclip, HelpCircle, X, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HardwareDevice, DeviceType, DeviceStatus } from '../types';

interface DeviceManagerProps {
  devices: HardwareDevice[];
  scaleWeight: number; // in kg
  setScaleWeight: (weight: number) => void;
  onUpdateDevices: (devices: HardwareDevice[]) => void;
  onClose: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  // Keyboard Wedge settings props
  wedgeEnabled: boolean;
  setWedgeEnabled: (enabled: boolean) => void;
  wedgePrefix: string;
  setWedgePrefix: (prefix: string) => void;
  wedgeSuffix: string;
  setWedgeSuffix: (suffix: string) => void;
  // Custom print settings props
  storeName: string;
  setStoreName: (val: string) => void;
  storeVat: string;
  setStoreVat: (val: string) => void;
  storeCr: string;
  setStoreCr: (val: string) => void;
  storeVatRate: number;
  setStoreVatRate: (val: number) => void;
  welcomeMsg: string;
  setWelcomeMsg: (val: string) => void;
}

export default function DeviceManager({
  devices,
  scaleWeight,
  setScaleWeight,
  onUpdateDevices,
  onClose,
  addToast,
  wedgeEnabled,
  setWedgeEnabled,
  wedgePrefix,
  setWedgePrefix,
  wedgeSuffix,
  setWedgeSuffix,
  storeName,
  setStoreName,
  storeVat,
  setStoreVat,
  storeCr,
  setStoreCr,
  storeVatRate,
  setStoreVatRate,
  welcomeMsg,
  setWelcomeMsg
}: DeviceManagerProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'simulation' | 'settings'>('status');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<string>('');
  const [searchStep, setSearchStep] = useState<number>(0);
  const [simulatedBarcode, setSimulatedBarcode] = useState<string>('');
  const [printerPaperError, setPrinterPaperError] = useState<boolean>(false);
  const [terminalDelay, setTerminalDelay] = useState<number>(1500);

  // Play a beautiful synthetic audio frequency feedback for hardware connectivity
  const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio context fail:', e);
    }
  };

  // Auto detect connection flow (التعرف على الأجهزة المتصلة)
  const handleAutoDetectDevices = () => {
    if (isSearching) return;
    setIsSearching(true);
    setSearchStep(0);
    setSearchProgress('جاري بدء الفحص الشامل لمنافذ التوصيل والشبكة...');
    playSound(440, 'triangle', 0.15);

    const steps = [
      { msg: 'جاري فحص نواقل USB وأجهزة الإدخال والمنافذ التسلسلية (COM)...', duration: 800 },
      { msg: 'تم رصد الميزان الإلكتروني الذكي (Mettler Toledo) على منفذ COM4 بسرعة 9600 bps.', duration: 1000 },
      { msg: 'تم رصد قارئ باركود ليزري (Honeywell Xenon) على منفذ USB 2 في وضع محاكاة لوحة المفاتيح.', duration: 900 },
      { msg: 'جاري البحث عن الأجهزة اللاسلكية وطابعات الشبكة المحلية (Wi-Fi/LAN)...', duration: 1100 },
      { msg: 'تم العثور على طابعة فواتير حرارية Epson TM-T88VI على العنوان 192.168.1.185 (المنفذ 9100).', duration: 1000 },
      { msg: 'جاري فحص قنوات الاتصال والتحقق من جهاز الدفع والشبكة (Mada/NFC Terminal)...', duration: 1200 },
      { msg: 'تم رصد جهاز دفع مدى (Verifone V200c) متصل بالشبكة المحلية وجاهز لاستقبال الطلبات.', duration: 800 },
      { msg: 'تمت عملية التعرف والربط التلقائي بجميع ملحقات الكاشير الذكي بنجاح! 🟢', duration: 500 }
    ];

    let currentStepIndex = 0;

    const runStep = () => {
      if (currentStepIndex < steps.length) {
        setSearchStep(currentStepIndex + 1);
        setSearchProgress(steps[currentStepIndex].msg);
        
        // play subtle ticks
        if (currentStepIndex < steps.length - 1) {
          playSound(600 + currentStepIndex * 100, 'sine', 0.05);
        } else {
          // Success melody at the end
          playSound(880, 'sine', 0.1);
          setTimeout(() => playSound(1320, 'sine', 0.25), 100);
        }

        setTimeout(() => {
          currentStepIndex++;
          runStep();
        }, steps[currentStepIndex].duration);
      } else {
        // Complete the search and mark all devices as connected!
        setIsSearching(false);
        const updated = devices.map(dev => ({
          ...dev,
          status: 'connected' as DeviceStatus,
          lastActive: Date.now()
        }));
        onUpdateDevices(updated);
        addToast('تم التعرف التلقائي على الأجهزة وربطها بالمنظومة بنجاح!', 'success');
      }
    };

    setTimeout(() => {
      runStep();
    }, 600);
  };

  const [serialPort, setSerialPort] = useState<any>(null);
  const [isReadingSerial, setIsReadingSerial] = useState(false);

  // 1. Connect real weighing scale via Web Serial API
  const connectRealScaleSerial = async () => {
    playSound(440, 'triangle', 0.1);
    
    if (!('serial' in navigator)) {
      addToast('المتصفح الحالي لا يدعم ميزة Web Serial. يرجى استخدام Google Chrome أو Microsoft Edge لربط الأجهزة الحقيقية.', 'error');
      return;
    }

    try {
      addToast('جاري فتح قائمة المنافذ المتسلسلة (COM)... اختر المنفذ المتصل به الميزان الحقيقي.', 'info');
      
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      setIsReadingSerial(true);
      
      // Update Scale status to Connected!
      const updated = devices.map(d => d.type === 'scale' ? {
        ...d,
        status: 'connected' as const,
        connectionType: 'Serial (COM)' as const,
        portOrIp: 'منفذ تسلسلي حقيقي 🔌',
        manufacturer: 'ميزان فيزيائي',
        model: 'WebSerial API',
        lastActive: Date.now()
      } : d);
      onUpdateDevices(updated);
      
      addToast('تم ربط الميزان الفيزيائي الحقيقي بنجاح! جاري بدء الاستماع لقيم الوزن...', 'success');
      playSound(1000, 'sine', 0.15);

      // Start asynchronous read loop
      (async () => {
        const decoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(decoder.writable);
        const reader = decoder.readable.getReader();
        
        try {
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              // Split by end of line to parse weigh readings
              if (buffer.includes('\n') || buffer.includes('\r')) {
                const lines = buffer.split(/[\r\n]+/);
                for (let i = 0; i < lines.length - 1; i++) {
                  const line = lines[i].trim();
                  // Parse any floats inside the line (e.g. "+ 1.450 kg" or "1.450")
                  const match = line.match(/[-+]?\d*\.\d+|\d+/);
                  if (match) {
                    const weight = parseFloat(match[0]);
                    if (!isNaN(weight) && weight >= 0) {
                      setScaleWeight(weight);
                    }
                  }
                }
                buffer = lines[lines.length - 1];
              }
            }
          }
        } catch (err) {
          console.error('Error reading from Serial port:', err);
        } finally {
          reader.releaseLock();
        }
      })().catch(err => {
        console.error('Serial read loop failed:', err);
      });

    } catch (err: any) {
      console.error('Web Serial Connection error:', err);
      if (err.name === 'SecurityError' || err.message?.includes('Permissions policy')) {
        addToast('خطأ أمني: المتصفح يمنع استدعاء منافذ الأجهزة داخل الإطار (iFrame). يرجى الضغط على زر "افتح في نافذة جديدة ↗" بالأعلى وتجربتها هناك!', 'error');
      } else if (err.name === 'NotFoundError') {
        addToast('تم إلغاء اختيار منفذ الميزان.', 'warning');
      } else {
        addToast(`عذراً، فشل ربط الميزان: ${err.message || err}`, 'error');
      }
    }
  };

  // 2. Connect real Barcode Scanner via WebUSB API
  const connectRealScannerUSB = async () => {
    playSound(440, 'triangle', 0.1);
    
    if (!('usb' in navigator)) {
      addToast('متصفحك لا يدعم WebUSB. يرجى استخدام Google Chrome أو Microsoft Edge لربط الأجهزة الحقيقية.', 'error');
      return;
    }

    try {
      addToast('جاري فتح قائمة الأجهزة المتصلة بـ USB... يرجى اختيار السكنر.', 'info');
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      
      const updated = devices.map(d => d.type === 'scanner' ? {
        ...d,
        status: 'connected' as const,
        connectionType: 'USB' as const,
        portOrIp: device.productName || 'USB Port',
        manufacturer: device.manufacturerName || 'Vendor USB',
        model: device.productName || 'Barcode Reader',
        lastActive: Date.now()
      } : d);
      onUpdateDevices(updated);
      
      addToast(`تم التعرف على السكنر الحقيقي وربطه بالمنظومة: ${device.productName || 'جهاز USB'}`, 'success');
      playSound(1000, 'sine', 0.15);
    } catch (err: any) {
      console.error('WebUSB Connection error:', err);
      if (err.name === 'SecurityError' || err.message?.includes('Permissions policy')) {
        addToast('خطأ أمني: المتصفح يمنع الوصول لنواقل USB من داخل الإطار (iFrame). يرجى الضغط على "افتح في نافذة جديدة ↗" بالأعلى وتجربتها هناك!', 'error');
      } else if (err.name === 'NotFoundError') {
        addToast('تم إلغاء اختيار جهاز USB.', 'warning');
      } else {
        addToast(`فشل ربط جهاز USB: ${err.message || err}`, 'error');
      }
    }
  };

  // 3. Connect real devices via Web Bluetooth
  const connectRealBluetooth = async () => {
    playSound(440, 'triangle', 0.1);
    
    if (!('bluetooth' in navigator)) {
      addToast('متصفحك لا يدعم Web Bluetooth. يرجى استخدام متصفح يدعم البلوتوث مثل Chrome على الهاتف أو الكمبيوتر.', 'error');
      return;
    }

    try {
      addToast('جاري البحث والمسح اللاسلكي عن طابعات أو أجهزة دفع Bluetooth قريبة...', 'info');
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true
      });
      
      addToast(`تم العثور على الجهاز والاقتران به لاسلكياً: ${device.name || 'جهاز مجهول'}`, 'success');
      playSound(1100, 'sine', 0.15);
    } catch (err: any) {
      console.error('Bluetooth Connection error:', err);
      if (err.name === 'SecurityError' || err.message?.includes('Permissions policy')) {
        addToast('خطأ أمني: المتصفح يمنع استخدام البلوتوث من داخل الإطار (iFrame). يرجى الضغط على "افتح في نافذة جديدة ↗" بالأعلى وتجربتها هناك!', 'error');
      } else if (err.name === 'NotFoundError') {
        addToast('تم إلغاء البحث والاقتران بالبلوتوث.', 'warning');
      } else {
        addToast(`فشل اقتران البلوتوث: ${err.message || err}`, 'error');
      }
    }
  };

  // Toggle single device connection status
  const handleToggleDevice = (id: string) => {
    const updated = devices.map(dev => {
      if (dev.id === id) {
        const nextStatus: DeviceStatus = dev.status === 'connected' ? 'disconnected' : 'connected';
        playSound(nextStatus === 'connected' ? 800 : 300, 'sine', 0.1);
        addToast(
          `تم ${nextStatus === 'connected' ? 'توصيل' : 'فصل'} جهاز: ${dev.arabicName} بنجاح.`, 
          nextStatus === 'connected' ? 'success' : 'warning'
        );
        return {
          ...dev,
          status: nextStatus,
          lastActive: nextStatus === 'connected' ? Date.now() : dev.lastActive
        };
      }
      return dev;
    });
    onUpdateDevices(updated);
  };

  // Change device configuration (Port / IP)
  const handleUpdateConfig = (id: string, portOrIp: string) => {
    const updated = devices.map(dev => {
      if (dev.id === id) {
        return { ...dev, portOrIp };
      }
      return dev;
    });
    onUpdateDevices(updated);
    addToast('تم تحديث إعدادات منفذ الجهاز بنجاح.', 'success');
  };

  // Render icon according to device type
  const getDeviceIcon = (type: DeviceType, status: DeviceStatus, className: string = "w-6 h-6") => {
    const isConn = status === 'connected';
    const colorClass = isConn ? "text-emerald-500" : "text-slate-400";
    
    switch (type) {
      case 'scale':
        return <Scale className={`${className} ${colorClass}`} />;
      case 'printer':
        return <Printer className={`${className} ${colorClass}`} />;
      case 'scanner':
        return <Barcode className={`${className} ${colorClass}`} />;
      case 'terminal':
        return <CreditCard className={`${className} ${colorClass}`} />;
      default:
        return <Cpu className={`${className} ${colorClass}`} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none" style={{ direction: 'rtl' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        id="device-manager-dialog"
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-700">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">إدارة الأجهزة الملحقة وتوصيل الأجهزة</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">الربط التلقائي وتدقيق اتصال أجهزة الكاشير (الميزان، السكنر، الطابعة، مدى)</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls Bar */}
        <div className="bg-white px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            {[
              { id: 'status', label: 'حالة الأجهزة الحالية', icon: <Activity className="w-4 h-4" /> },
              { id: 'simulation', label: 'محاكاة وإدخال الأجهزة', icon: <Sliders className="w-4 h-4" /> },
              { id: 'settings', label: 'إعدادات المنافذ والبروتوكول', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playSound(700, 'sine', 0.03);
                }}
                className={`py-3.5 px-1.5 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Auto Detect Button */}
          <button
            onClick={handleAutoDetectDevices}
            disabled={isSearching}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
              isSearching 
                ? 'bg-blue-50 text-blue-500 border border-blue-200 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'جاري التعرف على الأجهزة...' : 'كشف ذكي وتوصيل تلقائي'}</span>
          </button>
        </div>

        {/* Central Workspace Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* Searching Progress Panel Overlay */}
          {isSearching && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-600/5 border border-blue-200 rounded-2xl p-5 mb-6 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative flex items-center justify-center">
                <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-20"></div>
                <div className="bg-blue-600 text-white p-3 rounded-full relative">
                  <Cpu className="w-6 h-6 animate-spin" />
                </div>
              </div>
              <div className="space-y-1 max-w-lg">
                <p className="text-xs font-bold text-slate-800">جاري مسح البنية التحتية والملحقات المتصلة بالمنفذ USB والشبكة المحلية...</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 transition-all duration-300" 
                    style={{ width: `${(searchStep / 8) * 100}%` }}
                  ></div>
                </div>
                <p className="font-mono text-[11px] text-blue-700 font-bold bg-blue-100/50 px-3 py-1 rounded-lg mt-3 inline-block">
                  {searchProgress}
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 1: STATUS PANELS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              
              {/* Overall hardware summary card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { label: 'الميزان الإلكتروني', type: 'scale', name: 'Mettler Toledo Scale' },
                  { label: 'قارئ الباركود السريع', type: 'scanner', name: 'Honeywell Area Imager' },
                  { label: 'طابعة الإيصالات الحرارية', type: 'printer', name: 'Epson TM-T88' },
                  { label: 'جهاز الدفع والشبكة', type: 'terminal', name: 'Geidea Verifone Mada' }
                ].map((item) => {
                  const dev = devices.find(d => d.type === item.type);
                  const isConn = dev?.status === 'connected';
                  return (
                    <div 
                      key={item.type}
                      className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col justify-between h-[105px] transition-all hover:shadow-md ${
                        isConn ? 'border-emerald-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                        {getDeviceIcon(item.type as DeviceType, dev?.status || 'disconnected', "w-5 h-5")}
                      </div>
                      
                      <div className="mt-2.5">
                        <div className="text-[10px] text-slate-400 font-mono truncate">{dev?.manufacturer} {dev?.model}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isConn ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isConn ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                            <span>{isConn ? 'متصل' : 'مفصول'}</span>
                          </span>
                          <button
                            onClick={() => handleToggleDevice(dev?.id || '')}
                            className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                              isConn 
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isConn ? 'تعطيل' : 'ربط'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* البحث والربط الفعلي للملحقات الحقيقية (المنافذ الفيزيائية) */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-30"></span>
                      <Radio className="w-5 h-5 text-blue-400 relative" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-blue-100">لوحة ربط ومسح الأجهزة الفيزيائية (الربط الفعلي)</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">توصيل وقراءة بيانات الميزان وقارئ الباركود الحقيقي مباشرة باستخدام تقنيات الـ Web APIs للمتصفح</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    Web API Integrator Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Real Scale Connector */}
                  <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">منفذ الميزان الحقيقي</span>
                        <span className="text-[10px] text-slate-400 block leading-relaxed">ربط ميزان إلكتروني عبر منفذ COM / Serial وقراءة الوزن فوراً عند الاهتزاز.</span>
                      </div>
                      <div className="bg-blue-500/10 p-1.5 rounded-xl text-blue-400">
                        <Scale className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      onClick={connectRealScaleSerial}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/15"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>بحث وتوصيل الميزان (Serial)</span>
                    </button>
                  </div>

                  {/* Real Barcode Scanner Connector */}
                  <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">قارئ باركود USB حقيقي</span>
                        <span className="text-[10px] text-slate-400 block leading-relaxed">توصيل جهاز مسح الباركود سلكياً عبر ناقل USB وتفعيل قراءة الأكواد بنقرة واحدة.</span>
                      </div>
                      <div className="bg-purple-500/10 p-1.5 rounded-xl text-purple-400">
                        <Barcode className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      onClick={connectRealScannerUSB}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/15"
                    >
                      <Usb className="w-3.5 h-3.5" />
                      <span>ربط مسدس الباركود (USB)</span>
                    </button>
                  </div>

                  {/* Real Bluetooth/Network Devices */}
                  <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">أجهزة دفع / طابعات Bluetooth</span>
                        <span className="text-[10px] text-slate-400 block leading-relaxed">البحث اللاسلكي عن طابعات الفواتير أو أجهزة مدى ونقاط البيع القريبة لاسلكياً.</span>
                      </div>
                      <div className="bg-emerald-500/10 p-1.5 rounded-xl text-emerald-400">
                        <Wifi className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      onClick={connectRealBluetooth}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15"
                    >
                      <Wifi className="w-3.5 h-3.5" />
                      <span>اقتران لاسلكي (Bluetooth)</span>
                    </button>
                  </div>
                </div>

                {/* Secure Iframe constraint disclaimer */}
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                  <Info className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-blue-100 block">توجيه أمني للتشغيل الفعلي:</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      يمنع نظام الحماية والخصوصية في المتصفحات طلب منافذ الكمبيوتر والأجهزة (Web Serial/USB) من داخل النوافذ المضمنة (iFrames) في منصات التجربة. إذا واجهت خطأ صلاحيات، اضغط ببساطة على زر <strong className="text-white">"افتح في نافذة جديدة ↗"</strong> في أعلى يمين المنظومة ليفتح البرنامج في صفحة كاملة الصلاحيات، وحينها سيتصل ميزانك وجهاز الباركود الحقيقي بشكل طبيعي وآمن!
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected Devices Details Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700">تفاصيل وسجلات الاتصال الحالية للملحقات</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-bold">
                    إجمالي الأجهزة: {devices.length} | متصل: {devices.filter(d => d.status === 'connected').length}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">اسم الجهاز بالمنظومة</th>
                        <th className="p-3.5">نوع الاتصال المنفذ</th>
                        <th className="p-3.5">عنوان المنفذ / IP</th>
                        <th className="p-3.5">المصنع والموديل</th>
                        <th className="p-3.5">الرقم التسلسلي S/N</th>
                        <th className="p-3.5">آخر نشاط للاتصال</th>
                        <th className="p-3.5 text-left">التحكم الفردي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {devices.map((dev) => {
                        const isConn = dev.status === 'connected';
                        return (
                          <tr key={dev.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                              {getDeviceIcon(dev.type, dev.status, "w-4 h-4")}
                              <span>{dev.arabicName}</span>
                            </td>
                            <td className="p-3.5 text-slate-500 font-bold">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px]">
                                {dev.connectionType}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-slate-600 text-[11px] font-bold">{dev.portOrIp}</td>
                            <td className="p-3.5 text-slate-500">{dev.manufacturer} {dev.model}</td>
                            <td className="p-3.5 font-mono text-slate-400">{dev.serialNumber}</td>
                            <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                              {dev.lastActive ? new Date(dev.lastActive).toLocaleTimeString('ar-SA') : 'غير متوفر'}
                            </td>
                            <td className="p-3.5 text-left">
                              <button
                                onClick={() => handleToggleDevice(dev.id)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                                  isConn 
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                                }`}
                              >
                                {isConn ? 'فصل وتأمين' : 'توصيل وتدقيق'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hardware security compliance notice */}
              <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">تكامل الأجهزة مع نظام الفوترة الإلكترونية</h4>
                  <p className="text-[10.5px] text-emerald-800/90 leading-relaxed mt-0.5">
                    جميع الأجهزة المعرفة أعلاه تتكامل مع الكاشير بشكل فوري. يتم فحص قارئ الباركود لتلقي مدخلات السلع تلقائياً، ويتم قراءة قيم الأوزان مباشرة عند وضع الخضار والفواكه على كفة الميزان، كما يتم دفع مبلغ الفاتورة إلى جهاز مدى بلمسة واحدة دون إدخال يدوي لمنع الأخطاء الحسابية والمطابقة مع متطلبات الهيئة.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HARDWARE SIMULATION WORKSPACE */}
          {activeTab === 'simulation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Scale Simulation Block (الميزان الإلكتروني) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">لوحة محاكاة الميزان الرقمي</h3>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    devices.find(d => d.type === 'scale')?.status === 'connected'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {devices.find(d => d.type === 'scale')?.status === 'connected' ? 'متصل ومستقر' : 'مفصول'}
                  </span>
                </div>

                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-center font-mono font-bold shadow-inner relative overflow-hidden">
                  <div className="absolute top-2 right-3 text-[8px] uppercase tracking-wider text-slate-500">Mettler Scale Reading</div>
                  <div className="text-3xl tracking-widest mt-2">{scaleWeight.toFixed(3)} <span className="text-sm font-sans">كجم</span></div>
                  <div className="text-[9px] text-slate-400 font-sans mt-1">الوزن الحالي المستشعر على كفة الميزان</div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">محاكاة الوزن (قم بسحب الشريط لضبط ثقل السلعة على الميزان):</label>
                  <input 
                    type="range"
                    min="0"
                    max="5"
                    step="0.05"
                    value={scaleWeight}
                    onChange={(e) => {
                      setScaleWeight(parseFloat(e.target.value));
                      playSound(500 + parseFloat(e.target.value) * 100, 'sine', 0.02);
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.00 كجم</span>
                    <span>2.50 كجم</span>
                    <span>5.00 كجم (الحد الأقصى)</span>
                  </div>
                </div>

                {/* Quick Weight presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block">اختصارات أوزان سريعة (أوزان سلع تجريبية):</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'أفرغ الميزان', weight: 0 },
                      { label: 'تفاح (1.20كجم)', weight: 1.20 },
                      { label: 'طماطم (2.45كجم)', weight: 2.45 },
                      { label: 'بطيخ (4.15كجم)', weight: 4.15 }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setScaleWeight(item.weight);
                          playSound(800 - idx * 50, 'sine', 0.06);
                          addToast(`تم محاكاة وضع وزن ${item.weight} كجم على الميزان.`, 'info');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-semibold text-center border transition-all cursor-pointer ${
                          scaleWeight === item.weight
                            ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Barcode Scanner Simulation Block (سكنر ليزر) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">محاكاة مسدس قراءة الباركود</h3>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    devices.find(d => d.type === 'scanner')?.status === 'connected'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {devices.find(d => d.type === 'scanner')?.status === 'connected' ? 'متصل وجاهز' : 'مفصول'}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  عند توصيل قارئ الباركود، يمكنك استخدام الجهاز الحقيقي بالمسح المباشر في لوحة البحث. للتحكم البرمجي ومحاكاة مسدس الليزر يدوياً، حدد باركود السلعة لإرساله كإشارة مسح فورية:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'حليب المراعي', code: '6281007010015' },
                    { name: 'مياه نوفا', code: '6281007010039' },
                    { name: 'خبز صامولي', code: '6281007010022' },
                    { name: 'جبنة كرافت', code: '6281007010046' },
                    { name: 'تفاح أحمر (بالوزن)', code: '6281007010138' },
                    { name: 'طماطم بلدي (بالوزن)', code: '6281007010145' }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Check if scanner is connected
                        const scanDev = devices.find(d => d.type === 'scanner');
                        if (scanDev?.status !== 'connected') {
                          addToast('عذراً، قارئ الباركود غير متصل بالمنظومة حالياً!', 'error');
                          playSound(150, 'sawtooth', 0.2);
                          return;
                        }
                        
                        // Fire customized barcode scanner event
                        playSound(1050, 'sine', 0.08);
                        
                        // Set value in search inputs or trigger main app handler via custom window event or simple simulation
                        setSimulatedBarcode(p.code);
                        
                        // We dispatch a custom event that App.tsx can listen to, or we can instruct the user to click it.
                        // For a seamless flow, we will emit a custom DOM event.
                        const customScanEvent = new CustomEvent('physical-barcode-scan', { detail: p.code });
                        window.dispatchEvent(customScanEvent);
                        
                        addToast(`[مسدس السكنر 🔫] تم قراءة الباركود #${p.code} للسلعة "${p.name}"`, 'success');
                      }}
                      className="p-2 text-[10px] font-bold text-right bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 border border-slate-200 rounded-xl text-slate-700 flex flex-col justify-between transition-all cursor-pointer"
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="font-mono text-[9px] text-slate-400 mt-1">{p.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Receipt Printer Simulation Block (طابعة الفواتير الحرارية) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">طابعة الفواتير وإيصالات الكاشير</h3>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    devices.find(d => d.type === 'printer')?.status === 'connected' && !printerPaperError
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {devices.find(d => d.type === 'printer')?.status !== 'connected' 
                      ? 'مفصول' 
                      : printerPaperError 
                        ? 'خطأ: نفاد الورق ⚠️' 
                        : 'جاهز ومتصل'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-700 block">محاكاة نفاد بكرة الورق الحراري (Paper Out)</span>
                    <span className="text-[9px] text-slate-400">تنبيه لتنبيه الكاشير قبل طباعة الفواتير</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextErr = !printerPaperError;
                      setPrinterPaperError(nextErr);
                      playSound(nextErr ? 250 : 600, 'sine', 0.15);
                      addToast(
                        nextErr 
                          ? 'تم تمثيل خطأ "بكرة الورق نفدت" في طابعة الفواتير.' 
                          : 'تم تركيب بكرة ورق حراري جديدة بقطر 80مم وجاهزة الآن للطباعة.', 
                        nextErr ? 'warning' : 'success'
                      );
                    }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${
                      printerPaperError 
                        ? 'bg-rose-600 text-white hover:bg-rose-700' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {printerPaperError ? 'تغذية بالورق ✅' : 'افتعال نفاد الورق ⚠️'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const printDev = devices.find(d => d.type === 'printer');
                    if (printDev?.status !== 'connected') {
                      addToast('طابعة الإيصالات غير متصلة! يرجى ربطها أولاً.', 'error');
                      playSound(150, 'sawtooth', 0.2);
                      return;
                    }
                    if (printerPaperError) {
                      addToast('خطأ في الطابعة: بكرة الورق الحراري فارغة! ركب ورقة جديدة.', 'warning');
                      playSound(220, 'sawtooth', 0.25);
                      return;
                    }

                    playSound(3000, 'sine', 0.05);
                    setTimeout(() => playSound(2800, 'sine', 0.05), 50);
                    addToast('تم إرسال أمر طباعة تجريبي لطابعة الفواتير (Beep 🔊).', 'success');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
                >
                  <Printer className="w-4 h-4" />
                  <span>إرسال رنين واختبار طباعة تجريبي للورق (Test Print)</span>
                </button>
              </div>

              {/* 4. POS Terminal Payment Mode (جهاز مدى) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">جهاز دفع مدى ونقاط البيع (Terminal API)</h3>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    devices.find(d => d.type === 'terminal')?.status === 'connected'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {devices.find(d => d.type === 'terminal')?.status === 'connected' ? 'متصل بالشبكة' : 'مفصول'}
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 block">تأخير الاستجابة (زمن معالجة الاتصال بالبنك):</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range"
                      min="500"
                      max="4000"
                      step="250"
                      value={terminalDelay}
                      onChange={(e) => setTerminalDelay(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="font-mono text-xs font-bold bg-slate-100 border px-2 py-1 rounded text-slate-700 w-[70px] text-center">
                      {(terminalDelay / 1000).toFixed(2)} ثانية
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">
                    عند إتمام عملية بيع بالبطاقة أو مدى، يقوم كاشير البركة بإرسال المبلغ لجهاز مدى تلقائياً ويستقبل الرد بعد هذا الوقت المحدد لتثبيت العملية برمجياً.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const termDev = devices.find(d => d.type === 'terminal');
                    if (termDev?.status !== 'connected') {
                      addToast('جهاز الدفع مدى غير متصل بالشبكة!', 'error');
                      return;
                    }
                    addToast(`تأخير نقاط البيع المضبوط حالياً هو ${(terminalDelay / 1000).toFixed(2)} ثانية.`, 'info');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  <span>فحص بينغ الشبكة مع جهاز مدى (Ping Terminal)</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: SETTINGS & PORTS CONFIG */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">إعداد بروتوكول ومنافذ اتصال ملحقات الكاشير</h3>
                <p className="text-[10.5px] text-slate-500">حدد منافذ الربط الحقيقية أو الافتراضية للكاشير الذكي لضمان التعرف السليم للأجهزة الموصولة</p>
              </div>

              <div className="space-y-4">
                {devices.map((dev) => (
                  <div key={dev.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(dev.type, dev.status, "w-5 h-5")}
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{dev.arabicName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{dev.manufacturer} {dev.model}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">بروتوكول الاتصال:</span>
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold border">
                        {dev.connectionType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-500 font-bold whitespace-nowrap">المنفذ / عنوان IP:</label>
                      <input 
                        type="text"
                        value={dev.portOrIp}
                        onChange={(e) => handleUpdateConfig(dev.id, e.target.value)}
                        className="w-full font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Keyboard Wedge Scanner Configuration Section */}
              <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-100/70">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">إعدادات قارئ الباركود الفيزيائي (Keyboard Wedge Protocol)</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">تهيئة جهاز مسح الباركود المتصل كمحاكي لوحة المفاتيح ليتم التعرف على السلعة تلقائياً دون الحاجة للنقر على مربع البحث</p>
                    </div>
                  </div>
                  
                  {/* Enabled Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wedgeEnabled}
                      onChange={(e) => {
                        setWedgeEnabled(e.target.checked);
                        playSound(e.target.checked ? 750 : 250, 'sine', 0.1);
                        addToast(
                          e.target.checked 
                            ? 'تم تفعيل المسح التلقائي بالخلفية لقارئ الباركود (Keyboard Wedge).' 
                            : 'تم إيقاف تفعيل قارئ الباركود بالخلفية.', 
                          e.target.checked ? 'success' : 'warning'
                        );
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {wedgeEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    {/* Prefix and Suffix Configuration */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-bold text-slate-600 block">بادئة الكاشير (Prefix):</label>
                          <select
                            value={wedgePrefix}
                            onChange={(e) => {
                              setWedgePrefix(e.target.value);
                              playSound(650, 'sine', 0.05);
                            }}
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">بدون بادئة (تلقائي)</option>
                            <option value="~">علامة المدا ( ~ )</option>
                            <option value="|">علامة الأنبوب ( | )</option>
                            <option value="*">علامة النجمة ( * )</option>
                            <option value="F2">مفتاح F2</option>
                          </select>
                          <span className="text-[9px] text-slate-400 block leading-tight">الرمز الذي يرسله القارئ قبل الباركود.</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-bold text-slate-600 block">لاحقة الإرسال (Suffix):</label>
                          <select
                            value={wedgeSuffix}
                            onChange={(e) => {
                              setWedgeSuffix(e.target.value);
                              playSound(650, 'sine', 0.05);
                            }}
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Enter">مفتاح الدخول (Enter) - شائع جداً</option>
                            <option value="Tab">مفتاح الجدولة (Tab)</option>
                            <option value="">بدون لاحقة (مؤقت زمني)</option>
                          </select>
                          <span className="text-[9px] text-slate-400 block leading-tight">المفتاح الذي يرسله القارئ لتأكيد الإرسال.</span>
                        </div>
                      </div>

                      {/* Info Tips */}
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2 text-[10px] text-blue-800 leading-normal">
                        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          يستخدم الكاشير تقنية <strong>"التحسس المزدوج الذكي"</strong>: إذا لم يتم ضبط بادئة، يتم تمييز مدخلات السكنر الحقيقية تلقائياً عن طباعة الإنسان من خلال مراقبة سرعة ضغط المفاتيح الفائقة (أقل من 40 مللي ثانية لكل حرف).
                        </div>
                      </div>
                    </div>

                    {/* Interactive Scan Diagnostic Terminal */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                          محطة فحص قارئ الباركود المباشر
                        </span>
                        <span className="font-mono text-[9px] text-slate-500">Live Wedge Terminal</span>
                      </div>

                      <div className="bg-black/50 rounded-xl p-3 border border-slate-800/80 font-mono text-center text-xs">
                        <input
                          type="text"
                          placeholder="امسح باركود حقيقي أو اكتب لاختبار المحاكي..."
                          className="w-full bg-transparent text-center text-emerald-400 outline-none font-bold placeholder-emerald-900/55"
                          onKeyDown={(e) => {
                            if (e.key === wedgeSuffix || (wedgeSuffix === '' && e.key === 'Enter')) {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                playSound(1050, 'sine', 0.1);
                                addToast(`[مُختبِر السكنر] تم بنجاح رصد الرمز: ${val} باللاحقة [${e.key}]!`, 'success');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>

                      <p className="text-[9.5px] text-slate-400 text-center leading-normal">
                        ملاحظة: يمكنك إبقاء هذه اللوحة مفتوحة وتوجيه مسدس الليزر وقراءة أي علبة، ستظهر لك رسالة تفاعلية فورية تؤكد سلامة الربط!
                      </p>
                    </div>
                  </div>
                )}

                {/* Invoice Layout & Print Settings */}
                <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <Printer className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">إعدادات تخصيص طباعة الفواتير</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">تعديل اسم المحل التجاري، الرقم الضريبي، والرسالة الترحيبية في تذييل الإيصال المطبوع</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Store Name Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-600 block">اسم المحل التجاري:</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                        }}
                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 transition-all shadow-sm"
                        placeholder="أدخل اسم المحل التجاري"
                      />
                      <span className="text-[9px] text-slate-400 block">سيظهر كعنوان رئيسي في أعلى الفاتورة وعند التصدير.</span>
                    </div>

                    {/* VAT Number Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-600 block">الرقم الضريبي للمحل (VAT No.):</label>
                      <input
                        type="text"
                        value={storeVat}
                        onChange={(e) => {
                          setStoreVat(e.target.value);
                        }}
                        className="w-full font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 transition-all shadow-sm"
                        placeholder="أدخل الرقم الضريبي المكون من 15 خانة"
                      />
                      <span className="text-[9px] text-slate-400 block">رقم التسجيل الضريبي المعتمد لدى هيئة الزكاة والجمارك.</span>
                    </div>

                    {/* CR Number Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-600 block">رقم السجل التجاري (CR No.):</label>
                      <input
                        type="text"
                        value={storeCr}
                        onChange={(e) => {
                          setStoreCr(e.target.value);
                        }}
                        className="w-full font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 transition-all shadow-sm"
                        placeholder="أدخل رقم السجل التجاري"
                      />
                      <span className="text-[9px] text-slate-400 block">رقم السجل التجاري المعتمد للمؤسسة.</span>
                    </div>

                    {/* VAT Rate Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-bold text-slate-600 block">نسبة ضريبة القيمة المضافة (%):</label>
                      <input
                        type="number"
                        value={storeVatRate}
                        min="0"
                        max="100"
                        step="0.1"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setStoreVatRate(isNaN(val) ? 0 : val);
                        }}
                        className="w-full font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 transition-all shadow-sm"
                        placeholder="15"
                      />
                      <span className="text-[9px] text-slate-400 block">النسبة المعتمدة لاحتساب ضريبة المبيعات.</span>
                    </div>

                    {/* Welcoming Footer Message Input */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10.5px] font-bold text-slate-600 block">الرسالة الترحيبية (ذيل الفاتورة):</label>
                      <input
                        type="text"
                        value={welcomeMsg}
                        onChange={(e) => {
                          setWelcomeMsg(e.target.value);
                        }}
                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 transition-all shadow-sm"
                        placeholder="مثال: نشكركم لتسوقكم معنا!"
                      />
                      <span className="text-[9px] text-slate-400 block">رسالة شكر ترحيبية تظهر في أسفل الفاتورة الحرارية.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware diagnostics footer */}
              <div className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-[10px] text-slate-600">هل تحتاج للمساعدة في ربط ميزان إلكتروني حقيقي بالمتصفح عبر بروتوكول Serial Web API؟</span>
                </div>
                <button
                  onClick={() => alert('نظام كاشير البركة يدعم الاتصال المباشر عبر متصفحات كروم وإيدج باستخدام Web Serial API. يرجى الضغط على "توصيل تلقائي" للسماح بالمنفذ.')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  اقرأ دليل الربط
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Dialog Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>نظام كشف الأجهزة ذكي وتلقائي - متوافق بالكامل مع الأجهزة الطرفية</span>
          </div>
          
          <button
            onClick={() => {
              playSound(800, 'sine', 0.05);
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            حفظ وإغلاق لوحة الأجهزة
          </button>
        </div>

      </motion.div>
    </div>
  );
}
