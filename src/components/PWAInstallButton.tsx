import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'settings' | 'compact' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide or show installed badge
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>التطبيق مثبت ويعمل محلياً بصيغة PWA Standalone</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (!isInstallable && !isIOS && variant === 'header') {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        id="btn-pwa-install"
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
          variant === 'header'
            ? 'px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs'
            : 'px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs'
        }`}
        title="تثبيت نظام قيد كتطبيق سطح مكتب أو تطبيق جوال يعمل بدون إنترنت"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>{installSuccess ? 'تم التثبيت بنجاح!' : 'تثبيت التطبيق أوفلاين'}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-right border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <span>تثبيت قيد على أجهزة iPhone و iPad</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="flex items-center gap-2 font-medium">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>اضغط على زر المشاركة (Share ⬆️) في أسفل متصفح Safari.</span>
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>مرر للأسفل واضغط على <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</span>
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>سيفتح النظام بكامل الشاشة وبدون شريط المتصفح وبشكل أوفلاين تام.</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
