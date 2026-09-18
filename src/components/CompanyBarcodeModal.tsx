import React, { useState, useRef } from 'react';
import { 
  X, Printer, Copy, Check, Barcode, Building, Sparkles, RefreshCw, 
  Download, QrCode, Tag, ShieldCheck, ExternalLink, Store
} from 'lucide-react';
import { Company } from '../types';
import BarcodeRenderer from './BarcodeRenderer';

interface CompanyBarcodeModalProps {
  company: Company;
  onClose: () => void;
  onUpdateBarcode?: (companyId: string, newBarcode: string) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CompanyBarcodeModal: React.FC<CompanyBarcodeModalProps> = ({
  company,
  onClose,
  onUpdateBarcode,
  addToast
}) => {
  const [currentBarcode, setCurrentBarcode] = useState(company.barcode || `628${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBarcode, setTempBarcode] = useState(currentBarcode);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Generate new standard Saudi EAN-13 style store barcode
  const handleGenerateNew = () => {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newCode = `628${randomDigits}`;
    setTempBarcode(newCode);
    if (!isEditing) {
      setCurrentBarcode(newCode);
      if (onUpdateBarcode) {
        onUpdateBarcode(company.id, newCode);
      }
      addToast(`تم توليد باركود جديد للمنشأة: #${newCode}`, 'success');
    }
  };

  const handleSaveBarcode = () => {
    if (!tempBarcode.trim()) {
      addToast('الرجاء إدخال رقم باركود صحيح', 'error');
      return;
    }
    setCurrentBarcode(tempBarcode.trim());
    setIsEditing(false);
    if (onUpdateBarcode) {
      onUpdateBarcode(company.id, tempBarcode.trim());
    }
    addToast('تم حفظ وتحديث باركود المنشأة بنجاح! 💾', 'success');
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(currentBarcode);
    setCopied(true);
    addToast(`تم نسخ باركود المنشأة (${currentBarcode}) إلى الحافظة!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in text-right">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>باركود وملصق المنشأة / البقالة 🏪</span>
              </h3>
              <p className="text-[11px] text-slate-500">{company.name}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Barcode Sticker Preview (Printable Area) */}
          <div 
            ref={printRef}
            id="printable-company-barcode"
            className="bg-gradient-to-b from-white to-slate-50 border-2 border-dashed border-indigo-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 left-0 h-2 bg-indigo-600"></div>

            {/* Store Branding Header */}
            <div className="flex items-center justify-center gap-2 mb-3 mt-1">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                <Store className="w-4 h-4" />
              </div>
              <h4 className="text-base font-black text-slate-900">{company.name}</h4>
            </div>

            <p className="text-[10.5px] text-slate-500 font-mono mb-4">
              السجل التجاري: {company.crNumber || '1010000000'} • الرقم الضريبي: {company.vatNumber || '300055443300003'}
            </p>

            {/* Crisp 1D SVG Barcode */}
            <div className="my-2 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-inner w-full max-w-sm flex flex-col items-center">
              <BarcodeRenderer 
                value={currentBarcode} 
                height={65} 
                showText={false}
                className="w-full"
              />
              <div className="font-mono text-sm font-black text-slate-900 tracking-widest mt-1 select-all bg-slate-50 px-3 py-1 rounded-md border border-slate-150">
                {currentBarcode}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-indigo-700 bg-indigo-50/80 px-3 py-1.5 rounded-full mt-3 font-bold border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>امسح هذا الباركود بالجهاز للكشف عن المنشأة وتحديدها في الكاشير</span>
            </div>
          </div>

          {/* Barcode Quick Management */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>إدارة وتعديل رمز الباركود للبقالة:</span>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setTempBarcode(currentBarcode);
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                >
                  تعديل يدوي ✏️
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  إلغاء
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempBarcode}
                    onChange={(e) => setTempBarcode(e.target.value)}
                    placeholder="أدخل رقم الباركود التجاري..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateNew}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="توليد باركود عشوائي جديد"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>توليد</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveBarcode}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ باركود المنشأة الجديد 💾</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-sm select-all">
                    {currentBarcode}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyBarcode}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateNew}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>توليد جديد ⚡</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick usage guide */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>فائدة باركود البقالة/المنشأة:</strong> يمكنك طباعة هذا الملصق ولصقه عند طاولة الكاشير أو على بطاقات العمل، وبمجرد مسحه بقارئ الباركود أو كاميرا الجوال، يتعرف النظام فوراً على المنشأة وينقل الكاشير إليها بسرعة وأمان.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة ملصق الباركود للبقالة 🖨️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyBarcodeModal;
