import { useState, useEffect } from 'react';
import { CreditCard, Wifi, CheckCircle2, AlertCircle, Smartphone, Key, CircleDollarSign } from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '../types';

interface PaymentTerminalProps {
  total: number;
  paymentMethod: PaymentMethod;
  onPaymentSuccess: (authCode: string) => void;
  onPaymentCancel: () => void;
}

export default function PaymentTerminal({ total, paymentMethod, onPaymentSuccess, onPaymentCancel }: PaymentTerminalProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [approvalCode, setApprovalCode] = useState<string>('');

  // Sounds using Web Audio API
  const playTerminalSound = (type: 'beep' | 'success' | 'error' | 'click') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'beep') {
        // Simple POS read beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'success') {
        // High dual-tone double beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.08);

        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1500, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.12);
        }, 100);
      } else if (type === 'error') {
        // Buzz tone
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(180, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'click') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.03);
      }
    } catch (err) {
      console.warn('Audio context error:', err);
    }
  };

  useEffect(() => {
    // Phase 1: Connect to the network card reader terminal
    setStatus('processing');
    const timer = setTimeout(() => {
      playTerminalSound('beep');
      setStatus('idle'); // ready for card insertion or contactless wave
    }, 1500);

    return () => clearTimeout(timer);
  }, [paymentMethod]);

  const handleSimulateSwipe = (isSuccess: boolean = true) => {
    if (status !== 'idle') return;
    
    playTerminalSound('beep');
    setStatus('card_inserted');

    // NFC or card processing simulation
    setTimeout(() => {
      if (!isSuccess) {
        playTerminalSound('error');
        setErrorMessage('تم رفض العملية من البنك: رصيد غير كافٍ');
        setStatus('failed');
        return;
      }

      // If amount is high, simulate asking for PIN code
      if (total > 300) {
        setStatus('pin_required');
      } else {
        // No PIN needed for small amounts, go straight to authorization
        handleAuthorize();
      }
    }, 2000);
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) {
      playTerminalSound('error');
      return;
    }
    playTerminalSound('click');
    handleAuthorize();
  };

  const handleAuthorize = () => {
    setStatus('authorized');
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setApprovalCode(code);
      playTerminalSound('success');
      setStatus('completed');
      
      // Delay returning control so the user can enjoy the success screen
      setTimeout(() => {
        onPaymentSuccess(code);
      }, 1500);
    }, 2000);
  };

  const getPaymentLogo = () => {
    switch (paymentMethod) {
      case 'mada':
        return (
          <span className="inline-flex items-center gap-1 font-bold italic tracking-tight bg-sky-600 text-white px-2.5 py-0.5 rounded text-xs">
            mada <span className="text-amber-400 font-extrabold">مدى</span>
          </span>
        );
      case 'apple_pay':
        return (
          <span className="inline-flex items-center gap-1 font-semibold tracking-tight bg-black text-white px-2 py-0.5 rounded text-xs">
             Pay
          </span>
        );
      case 'visa':
        return (
          <span className="inline-flex items-center gap-0.5 font-bold italic text-blue-800 bg-white border border-gray-200 px-2.5 py-0.5 rounded text-[11px]">
            VISA
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-slate-900 text-slate-100 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative">
        
        {/* Terminal Case Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-widest text-slate-400">POS TERMINAL v2.1</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono">LTE</span>
          </div>
        </div>

        {/* Physical screen of the POS terminal */}
        <div className="p-5 bg-slate-900 flex-1">
          <div className="bg-indigo-950/80 border-2 border-indigo-500/30 rounded-2xl p-5 min-h-[220px] shadow-inner flex flex-col justify-between relative overflow-hidden">
            {/* Glowing screen effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>

            {/* Top row of screen: Vendor & Mode */}
            <div className="flex justify-between items-center text-[11px] text-indigo-300 font-medium z-10">
              <span>بقالة البركة</span>
              <div className="flex items-center gap-1.5">
                {getPaymentLogo()}
              </div>
            </div>

            {/* Screen Body States */}
            <div className="my-auto text-center z-10 py-4">
              {status === 'processing' && (
                <div className="space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-indigo-200">جاري الاتصال بقارئ البطاقات المدمج...</p>
                </div>
              )}

              {status === 'idle' && (
                <div className="space-y-3">
                  <div className="flex justify-center gap-3 text-indigo-400">
                    <Smartphone className="w-8 h-8 animate-bounce" />
                    <CreditCard className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-base font-bold text-white">مرر بطاقة الدفع أو الجوال</p>
                  <p className="text-xs text-indigo-300">انتظار التمرير (NFC) أو الإدخال...</p>
                </div>
              )}

              {status === 'card_inserted' && (
                <div className="space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-white">جاري قراءة البطاقة الحيوية...</p>
                  <p className="text-xs text-indigo-300">الرجاء عدم سحب البطاقة أو إبعاد الهاتف</p>
                </div>
              )}

              {status === 'pin_required' && (
                <div className="space-y-2">
                  <Key className="w-7 h-7 text-amber-400 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-white">الرجاء إدخال الرقم السري للبطاقة</p>
                  <div className="h-8 flex justify-center items-center gap-1.5 font-mono text-2xl font-bold tracking-widest text-amber-400">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full border-2 border-amber-500/50 flex items-center justify-center ${
                          i < pin.length ? 'bg-amber-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-indigo-300">لعملية أكثر أماناً للمبالغ الكبيرة</p>
                </div>
              )}

              {status === 'authorized' && (
                <div className="space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-white">جاري الاتصال بالبنك المركزي (مدى)...</p>
                  <p className="text-xs text-indigo-300">يرجى الانتظار لتأكيد الخصم...</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="space-y-2.5">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-scale" />
                  <p className="text-base font-bold text-emerald-300">مقبول - تمت العملية</p>
                  <p className="text-xs text-indigo-300">رقم الموافقة: <span className="font-mono font-bold text-white">{approvalCode}</span></p>
                </div>
              )}

              {status === 'failed' && (
                <div className="space-y-2.5">
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-rose-400">فشلت العملية</p>
                  <p className="text-[11px] text-rose-300 leading-snug px-2">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* Screen bottom bar: Purchase Amount */}
            <div className="flex justify-between items-end border-t border-indigo-500/20 pt-2 z-10">
              <span className="text-[10px] text-indigo-300">المبلغ المطلوب:</span>
              <span className="font-mono font-bold text-white text-lg tracking-tight">
                {total.toFixed(2)} <span className="text-[11px] font-sans">ر.س</span>
              </span>
            </div>
          </div>
        </div>

        {/* Physical Button Pad / Simulation Utilities */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
          
          {/* Simulation controller cards (Interactive triggers for testing the POS) */}
          {status === 'idle' && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-slate-500 tracking-wider text-center uppercase">وحدة محاكاة البطاقة البنكية</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulateSwipe(true)}
                  className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-200 border border-slate-700/60 font-medium text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>تمرير بطاقة ناجحة</span>
                </button>
                <button
                  onClick={() => handleSimulateSwipe(false)}
                  className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-200 border border-slate-700/60 font-medium text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  <span>تمرير بطاقة مرفوضة</span>
                </button>
              </div>
            </div>
          )}

          {/* NumPad Simulator for PIN code entries */}
          {status === 'pin_required' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (pin.length < 4) {
                        playTerminalSound('click');
                        setPin(prev => prev + num);
                      }
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-sm text-slate-200 active:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                {/* Clear (Red) */}
                <button
                  onClick={() => {
                    playTerminalSound('click');
                    setPin('');
                  }}
                  className="p-2.5 bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  مسح
                </button>
                {/* Zero */}
                <button
                  onClick={() => {
                    if (pin.length < 4) {
                      playTerminalSound('click');
                      setPin(prev => prev + '0');
                    }
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-sm text-slate-200 transition-colors cursor-pointer"
                >
                  0
                </button>
                {/* Enter (Green) */}
                <button
                  onClick={handlePinSubmit}
                  className="p-2.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-50 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  إدخال
                </button>
              </div>
            </div>
          )}

          {/* Terminal Bottom Actions */}
          <div className="flex justify-between items-center gap-3 pt-2">
            <button
              onClick={onPaymentCancel}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer text-center"
            >
              إلغاء العملية
            </button>
            {status === 'failed' && (
              <button
                onClick={() => {
                  playTerminalSound('click');
                  setStatus('idle');
                  setErrorMessage('');
                }}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                المحاولة مجدداً
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
