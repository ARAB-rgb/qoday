import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, Copy, Check, ShieldAlert, ShieldCheck, 
  HelpCircle, RefreshCw, AlertTriangle, Sparkles, Terminal, ArrowRight
} from 'lucide-react';
import { 
  LicenseInfo, 
  verifyOfflineActivationKey, 
  generateOfflineActivationKey, 
  getOrCreateDeviceHardwareId 
} from '../lib/offlineLicense';

interface OfflineLockScreenProps {
  licenseInfo: LicenseInfo;
  onActivated: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const OfflineLockScreen: React.FC<OfflineLockScreenProps> = ({
  licenseInfo,
  onActivated,
  isModal = false,
  onCloseModal
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [activationKeyInput, setActivationKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Admin key generator demo tool
  const [showAdminTool, setShowAdminTool] = useState(false);
  const [generatedKeyOutput, setGeneratedKeyOutput] = useState('');
  const [genDurationDays, setGenDurationDays] = useState(365);
  const [genClientName, setGenClientName] = useState(licenseInfo.clientName || 'مؤسسة قيد التجارية');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedGenKey, setCopiedGenKey] = useState(false);

  const handleCopyDeviceId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(licenseInfo.deviceId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    }
  };

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activationKeyInput.trim()) {
      setFeedback({ type: 'error', message: 'يرجى إدخال أو لصق كود التفعيل الرقمي' });
      return;
    }

    setIsVerifying(true);
    setFeedback({ type: 'info', message: 'جاري التحقق من التوقيع الرقمي لخوارزمية ECDSA أوفلاين...' });

    try {
      const result = await verifyOfflineActivationKey(activationKeyInput.trim(), licenseInfo.deviceId);
      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => {
          onActivated();
          if (onCloseModal) onCloseModal();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: `خطأ أثناء فحص الكود: ${err?.message || 'غير معروف'}` });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateAdminKey = async () => {
    setIsGenerating(true);
    try {
      const key = await generateOfflineActivationKey(
        licenseInfo.deviceId,
        genClientName,
        genDurationDays,
        500
      );
      setGeneratedKeyOutput(key);
    } catch (err: any) {
      alert('خطأ في توليد المفتاح: ' + err?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const isLocked = licenseInfo.status === 'expired_locked' || licenseInfo.status === 'tampered_locked';

  const containerContent = (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
      {/* Top Banner Header */}
      <div className={`p-6 text-white text-center relative overflow-hidden ${
        licenseInfo.status === 'tampered_locked' 
          ? 'bg-gradient-to-br from-rose-600 to-red-800' 
          : isLocked 
            ? 'bg-gradient-to-br from-slate-900 to-indigo-950' 
            : 'bg-gradient-to-br from-indigo-600 to-blue-700'
      }`}>
        {isModal && onCloseModal && (
          <button 
            onClick={onCloseModal}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition"
          >
            ✕
          </button>
        )}

        <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-3 ring-1 ring-white/20">
          {licenseInfo.status === 'tampered_locked' ? (
            <ShieldAlert className="w-8 h-8 text-rose-300 animate-pulse" />
          ) : isLocked ? (
            <Lock className="w-8 h-8 text-amber-300 animate-bounce" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          )}
        </div>

        <h2 className="text-xl font-black tracking-tight">
          {licenseInfo.status === 'tampered_locked'
            ? 'قفل أمني: تم رصد تلاعب في توقيت النظام'
            : isLocked
              ? 'انتهت مهلة السداد والاشتراك السنوي - نظام قيد'
              : 'إدارة وتجديد الاشتراك السنوي أوفلاين (QAYD)'}
        </h2>

        <p className="mt-1 text-xs text-white/80 max-w-md mx-auto leading-relaxed">
          {licenseInfo.status === 'tampered_locked'
            ? 'تم رصد إرجاع لساعة الجهاز للخلف لتجاوز مهلة السداد. لحماية البيانات يرجى ضبط الساعة الصحيحة أو إدخال كود التفعيل.'
            : isLocked
              ? 'انتهت فترة الاشتراك السنوي (500 ريال) وانتهت مهلة السداد (30 يوماً). يُرجى التجديد لمتابعة العمليات.'
              : 'نظام نقاط البيع والمبيعات (قيد) يدعم العمل أوفلاين والتفعيل المشفر دون إنترنت.'}
        </p>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        {/* Device Fingerprint Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">معرّف الجهاز الرقمي (Device Hardware ID):</span>
            <span className="text-[10px] text-slate-400 font-mono">بصمة مشفرة ومستقرة</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={licenseInfo.deviceId}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-black text-indigo-700 text-center select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyDeviceId}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              title="نسخ المعرّف لإرساله للدعم الفني"
            >
              {copiedId ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            قم بنسخ هذا المعرّف وإرساله لإدارة النظام عبر واتساب أو الدعم الفني لإصدار كود التفعيل الخاص بجهازك.
          </p>
        </div>

        {/* Subscription Info Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
            <span className="text-[10px] text-slate-400 block">رسوم الاشتراك السنوي</span>
            <span className="text-base font-black text-slate-800">500 ر.س</span>
            <span className="text-[10px] text-slate-500 block">سنوياً (365 يوم)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
            <span className="text-[10px] text-slate-400 block">مهلة السداد الإضافية</span>
            <span className="text-base font-black text-amber-600">30 يوماً</span>
            <span className="text-[10px] text-slate-500 block">بعد انتهاء الاشتراك</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
            <span className="text-[10px] text-slate-400 block">حالة التفعيل الحالية</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
              licenseInfo.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : licenseInfo.status === 'grace_period'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
            }`}>
              {licenseInfo.status === 'active'
                ? `نشط (بقي ${licenseInfo.daysRemaining} يوم)`
                : licenseInfo.status === 'grace_period'
                  ? `مهلة سداد (بقي ${licenseInfo.graceDaysRemaining} يوم)`
                  : 'مقفل / بانتظار التفعيل'}
            </span>
          </div>
        </div>

        {/* Offline Activation Key Form */}
        <form onSubmit={handleActivate} className="space-y-3">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>كود التفعيل الرقمي أوفلاين (Activation Key):</span>
          </label>

          <textarea
            rows={3}
            value={activationKeyInput}
            onChange={(e) => setActivationKeyInput(e.target.value)}
            placeholder="الصق كود التفعيل الرقمي المزوّد من الإدارة هنا (يبدأ بـ QAYD-KEY-...)"
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
          />

          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : feedback.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {feedback.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : feedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !activationKeyInput.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التحقق من التوقيع الرقمي...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>تحقق وتفعيل النظام الآن (أوفلاين)</span>
              </>
            )}
          </button>
        </form>

        {/* Support & Contact Details */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div>
            <span className="font-bold block">هل تحتاج مساعدة أو تود تجديد الاشتراك؟</span>
            <span className="text-[11px] text-emerald-700">تواصل مع إدارة مبيعات ودعم قيد (Hostinger / SaaS) عبر واتساب</span>
          </div>
          <a
            href={`https://wa.me/9665564468888?text=${encodeURIComponent(`السلام عليكم، أود تفعيل أو تجديد اشتراك نظام قيد السنوي (500 ريال). معرّف جهازي هو:\n${licenseInfo.deviceId}`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shrink-0"
          >
            تواصل عبر واتساب 💬
          </a>
        </div>

        {/* Developer & Super Admin Key Generator Sandbox */}
        <div className="border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={() => setShowAdminTool(!showAdminTool)}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            <span>{showAdminTool ? 'إخفاء مولّد المفاتيح للمشرف / الاختبار التجريبي' : 'أداة المشرف / المطور: توليد كود تفعيل فوري للتجربة'}</span>
          </button>

          {showAdminTool && (
            <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-amber-400 font-sans font-bold text-[11px]">
                <span>أداة توليد كود التفعيل الرقمي (Admin Key Generator) 🔐</span>
                <span className="text-[10px] text-slate-400">توقيع ECDSA P-256</span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans">
                هذه الأداة مخصصة لمشرفي النظام أو لتشغيلها عبر استضافة Hostinger لتوليد كود تفعيل موقّع بالمفتاح السري. يمكنك توليد كود تجريبي لهذا الجهاز بنقرة واحدة:
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div>
                  <label className="text-slate-400 block text-[10px]">اسم العميل / المؤسسة:</label>
                  <input
                    type="text"
                    value={genClientName}
                    onChange={(e) => setGenClientName(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[10px]">مدة الاشتراك:</label>
                  <select
                    value={genDurationDays}
                    onChange={(e) => setGenDurationDays(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs font-sans"
                  >
                    <option value={365}>سنة كاملة (365 يوم - 500 ر.س)</option>
                    <option value={730}>سنتين (730 يوم - 1000 ر.س)</option>
                    <option value={30}>شهر تجريبي (30 يوم)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAdminKey}
                disabled={isGenerating}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-sans font-bold text-xs transition cursor-pointer"
              >
                {isGenerating ? 'جاري توقيع الكود بالمفتاح الخاص...' : 'توليد كود التفعيل الرقمي الآن ⚡'}
              </button>

              {generatedKeyOutput && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                    <span>الكود الموقّع بنجاح:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(generatedKeyOutput);
                          setCopiedGenKey(true);
                          setActivationKeyInput(generatedKeyOutput);
                          setTimeout(() => setCopiedGenKey(false), 2000);
                        }
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      {copiedGenKey ? 'تم النسخ واللصق في الحقل!' : 'نسخ ولصق في حقل التفعيل ⬆️'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={2}
                    value={generatedKeyOutput}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-[10px] text-emerald-400 select-all"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If used as modal
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        {containerContent}
      </div>
    );
  }

  // If full lock screen
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      {containerContent}
    </div>
  );
};
