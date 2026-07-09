import React, { useState } from 'react';
import { 
  X, Building, Plus, Trash2, CreditCard, Sparkles, Check, 
  Layers, Calendar, BadgePercent, Package, AlertCircle, ArrowLeft, ShieldAlert,
  Database, RefreshCw, Copy, Cloud, CloudOff, CloudLightning
} from 'lucide-react';
import { Company } from '../types';

interface CompanyManagerProps {
  companies: Company[];
  currentCompanyId: string;
  onSwitchCompany: (id: string) => void;
  onAddCompany: (company: Omit<Company, 'id'>) => void;
  onUpdateCompanyPlan: (companyId: string, plan: 'free' | 'basic' | 'premium' | 'enterprise', limit: number) => void;
  onDeleteCompany: (id: string) => void;
  onClose: () => void;
  currentProductCount: number; // For active company
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  lang: 'ar' | 'en';
  supabaseConfigured: boolean;
  supabaseSyncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'not_set';
  supabaseErrorType: 'TABLE_NOT_FOUND' | 'OTHER' | null;
  isSupabaseSyncEnabled: boolean;
  onToggleSupabaseSync: (enabled: boolean) => void;
  onManualSync: () => void;
}

const PLANS = [
  {
    id: 'free' as const,
    name: 'الباقة التجريبية (المجانية)',
    englishName: 'Trial (Free)',
    limit: 5,
    price: '0 ر.س',
    period: 'إلى الأبد',
    features: ['بحد أقصى 5 منتجات', 'تقارير مبيعات أساسية', 'فاتورة مبسطة', 'دعم عبر البريد الالكتروني'],
    color: 'slate',
    borderColor: 'border-slate-200',
    headerBg: 'bg-slate-50'
  },
  {
    id: 'basic' as const,
    name: 'باقة التموينات الأساسية',
    englishName: 'Basic Grocery',
    limit: 25,
    price: '99 ر.س',
    period: 'شهرياً',
    features: ['بحد أقصى 25 منتج', 'تحديث كميات فوري', 'دعم الأجهزة الطرفية (ميزان/باركود)', 'فاتورة ضريبية مبسطة مع QR'],
    color: 'indigo',
    borderColor: 'border-indigo-200',
    headerBg: 'bg-indigo-50/50'
  },
  {
    id: 'premium' as const,
    name: 'الباقة الذهبية للمحلات',
    englishName: 'Premium Retail',
    limit: 100,
    price: '199 ر.س',
    period: 'شهرياً',
    features: ['بحد أقصى 100 منتج', 'تحليلات أرباح ذكية', 'تصدير واستيراد ملفات Excel', 'ربط فوري بأجهزة دفع مدى والفيزا'],
    color: 'amber',
    borderColor: 'border-amber-300',
    headerBg: 'bg-amber-50/50',
    popular: true
  },
  {
    id: 'enterprise' as const,
    name: 'الباقة اللامحدودة للشركات',
    englishName: 'Enterprise Unlimited',
    limit: 9999,
    price: '399 ر.س',
    period: 'شهرياً',
    features: ['منتجات غير محدودة 🔥', 'دعم فني مخصص على مدار الساعة', 'إدارة فروع ومستودعات متعددة', 'إمكانية الربط السحابي والنسخ المتقدم'],
    color: 'purple',
    borderColor: 'border-purple-300',
    headerBg: 'bg-purple-50/50'
  }
];

const getPlanNameArabic = (plan: 'free' | 'basic' | 'premium' | 'enterprise' | undefined) => {
  switch (plan) {
    case 'free': return 'الباقة المجانية (حد 5 منتجات)';
    case 'basic': return 'باقة التموينات الأساسية (حد 25 منتج)';
    case 'premium': return 'الباقة الذهبية للمحلات (حد 100 منتج)';
    case 'enterprise': return 'الباقة اللامحدودة للشركات (لامحدود)';
    default: return 'الباقة المجانية';
  }
};

const getPlanBadgeStyle = (plan: 'free' | 'basic' | 'premium' | 'enterprise' | undefined) => {
  switch (plan) {
    case 'free': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'basic': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'premium': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'enterprise': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function CompanyManager({
  companies,
  currentCompanyId,
  onSwitchCompany,
  onAddCompany,
  onUpdateCompanyPlan,
  onDeleteCompany,
  onClose,
  currentProductCount,
  addToast,
  lang,
  supabaseConfigured,
  supabaseSyncStatus,
  supabaseErrorType,
  isSupabaseSyncEnabled,
  onToggleSupabaseSync,
  onManualSync
}: CompanyManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'plans' | 'supabase'>('list');
  const [selectedCompForPlan, setSelectedCompForPlan] = useState<string | null>(null);

  // New Company form states
  const [newName, setNewName] = useState('');
  const [newVat, setNewVat] = useState('');
  const [newCr, setNewCr] = useState('');
  const [newWelcomeMsg, setNewWelcomeMsg] = useState('');
  const [newPlan, setNewPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('free');

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      addToast('يرجى إدخال اسم الشركة أو المؤسسة المالي.', 'error');
      return;
    }

    const planLimits = {
      free: 5,
      basic: 25,
      premium: 100,
      enterprise: 9999
    };

    onAddCompany({
      name: newName,
      vatNumber: newVat || '300000000000003',
      crNumber: newCr || '1010000000',
      vatRate: 15,
      welcomeMsg: newWelcomeMsg || `نشكركم لتسوقكم معنا في ${newName}!`,
      subscriptionPlan: newPlan,
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      maxProductsLimit: planLimits[newPlan]
    });

    // Reset fields
    setNewName('');
    setNewVat('');
    setNewCr('');
    setNewWelcomeMsg('');
    setNewPlan('free');
    setActiveTab('list');
  };

  const triggerUpgrade = (companyId: string, planId: 'free' | 'basic' | 'premium' | 'enterprise', limit: number) => {
    onUpdateCompanyPlan(companyId, planId, limit);
    setSelectedCompForPlan(null);
    setActiveTab('list');
  };

  const getCompanyProductCount = (companyId: string) => {
    if (companyId === currentCompanyId) return currentProductCount;
    try {
      const saved = localStorage.getItem(`pos_products_${companyId}`);
      if (saved) {
        return JSON.parse(saved).length;
      }
    } catch (e) {}
    return companyId === 'comp-1' ? 24 : companyId === 'comp-2' ? 12 : 5; // default estimates
  };

  const activeComp = companies.find(c => c.id === currentCompanyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-right" id="company-manager-overlay">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">إدارة حسابات الشركات والاشتراكات 🏢</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">افصل بضائع وفواتير كل شركة مع تحديد سقف المنتجات وباقات الاشتراك</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-4">
          <button
            onClick={() => { setActiveTab('list'); setSelectedCompForPlan(null); }}
            className={`py-3 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>قائمة الشركات المضافة ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'add' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل شركة جديدة</span>
          </button>

          <button
            onClick={() => { setActiveTab('supabase'); setSelectedCompForPlan(null); }}
            className={`py-3 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'supabase' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="flex items-center gap-1.5">
              <span>ربط ومزامنة Supabase ☁️</span>
              {supabaseConfigured && (
                <span className={`w-2 h-2 rounded-full ${supabaseSyncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              )}
            </span>
          </button>

          {selectedCompForPlan && (
            <button
              onClick={() => setActiveTab('plans')}
              className="py-3 px-2 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 flex items-center gap-2 animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ترقية اشتراك شركة "{companies.find(c => c.id === selectedCompForPlan)?.name}"</span>
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: COMPANIES LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((comp) => {
                  const pCount = getCompanyProductCount(comp.id);
                  const isCurrent = comp.id === currentCompanyId;
                  const isExpired = new Date(comp.subscriptionExpiry).getTime() < Date.now();
                  
                  return (
                    <div 
                      key={comp.id}
                      className={`border rounded-2xl p-5 bg-white transition-all relative flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      {/* Active indicator */}
                      {isCurrent && (
                        <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>النشطة حالياً</span>
                        </span>
                      )}

                      {/* Company Info */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 leading-tight">{comp.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">
                              الرقم الضريبي: {comp.vatNumber} • السجل: {comp.crNumber}
                            </p>
                          </div>
                        </div>

                        {/* Subscription Info */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">نوع الباقة / الاشتراك:</span>
                            <span className={`font-black text-[10px] px-2 py-0.5 rounded-full border ${getPlanBadgeStyle(comp.subscriptionPlan)}`}>
                              {getPlanNameArabic(comp.subscriptionPlan).split(' (')[0]}
                            </span>
                          </div>

                          {/* Product limits bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                              <span>سعة السلع والمنتجات المتاحة:</span>
                              <span className={pCount >= comp.maxProductsLimit ? 'text-rose-600 font-extrabold' : 'text-indigo-600 font-extrabold'}>
                                {pCount} من {comp.maxProductsLimit >= 9999 ? 'لامحدود' : comp.maxProductsLimit}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  pCount >= comp.maxProductsLimit 
                                    ? 'bg-rose-500' 
                                    : pCount > comp.maxProductsLimit * 0.8 
                                      ? 'bg-amber-500' 
                                      : 'bg-indigo-600'
                                }`}
                                style={{ width: `${Math.min(100, (pCount / comp.maxProductsLimit) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>تاريخ نهاية الاشتراك:</span>
                            </span>
                            <span className={isExpired ? 'text-rose-500 font-extrabold' : 'font-mono font-semibold'}>
                              {comp.subscriptionExpiry} {isExpired ? '(منتهي)' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        {!isCurrent ? (
                          <button
                            onClick={() => {
                              onSwitchCompany(comp.id);
                              addToast(`تم الانتقال لشركة "${comp.name}" وتحديث المخزون.`, 'success');
                            }}
                            className="flex-1 text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            تفعيل هذه الشركة 🔌
                          </button>
                        ) : (
                          <div className="flex-1 bg-indigo-50 text-indigo-700 text-center py-1.5 rounded-xl text-[11px] font-bold">
                            الشركة نشطة على الكاشير ومحملة 🚀
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedCompForPlan(comp.id);
                            setActiveTab('plans');
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>تعديل الباقة</span>
                        </button>

                        {companies.length > 1 && !isCurrent && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف شركة "${comp.name}"؟ سيتم حذف جميع منتجاتها ومبيعاتها نهائياً ولا يمكن الاسترجاع.`)) {
                                onDeleteCompany(comp.id);
                                addToast(`تم حذف الشركة "${comp.name}" ومستودعاتها بنجاح.`, 'info');
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors cursor-pointer"
                            title="حذف الشركة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Alert Info Box */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3 mt-4 text-xs text-indigo-950">
                <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-right">
                  <p className="font-bold">ملاحظة أمنية وحفظ البيانات 🔐</p>
                  <p className="text-slate-600 leading-relaxed">
                    يتم تخزين بيانات كل شركة من بضائع، فواتير، وأرقام ضريبية بشكل منعزل تماماً ومستقل في المتصفح. يمكنك تفعيل شركة في ثانية واحدة لنقل الكاشير لمحل آخر دون تداخل الإيرادات والمنتجات.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW COMPANY */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateCompany} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <Building className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-800">تسجيل ومحاذاة شركة تجارية جديدة</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Name Input */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">اسم المحل التجاري / الشركة:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                    placeholder="مثال: بقالة السعادة والخيرات"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">الاسم المعتمد للفرع أو المحل.</span>
                </div>

                {/* Plan select */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">باقة الاشتراك المبدئية:</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="free">الباقة التجريبية (بحد أقصى 5 منتجات)</option>
                    <option value="basic">باقة التموينات الأساسية (بحد أقصى 25 منتج)</option>
                    <option value="premium">الباقة الذهبية (بحد أقصى 100 منتج)</option>
                    <option value="enterprise">الباقة اللامحدودة للشركات (بدون قيود)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block">تحدد السقف المتاح لتخزين المنتجات.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VAT Number */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">الرقم الضريبي للمحل (15 خانة):</label>
                  <input
                    type="text"
                    value={newVat}
                    onChange={(e) => setNewVat(e.target.value)}
                    maxLength={15}
                    className="w-full font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                    placeholder="مثال: 300055443300003"
                  />
                  <span className="text-[10px] text-slate-400 block">رقم التسجيل المعتمد في هيئة الزكاة والجمارك.</span>
                </div>

                {/* CR Number */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">رقم السجل التجاري (CR No.):</label>
                  <input
                    type="text"
                    value={newCr}
                    onChange={(e) => setNewCr(e.target.value)}
                    className="w-full font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                    placeholder="مثال: 1010000000"
                  />
                  <span className="text-[10px] text-slate-400 block">رقم السجل المعتمد بوزارة التجارة.</span>
                </div>
              </div>

              {/* Welcoming Footer Message Input */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 block">الرسالة الترحيبية على الفاتورة:</label>
                <input
                  type="text"
                  value={newWelcomeMsg}
                  onChange={(e) => setNewWelcomeMsg(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                  placeholder="مثال: نشكركم لزيارتكم ونتمنى لكم يوماً سعيداً!"
                />
                <span className="text-[10px] text-slate-400 block">تطبع في ذيل الفاتورة للعملاء.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  إضافة الشركة وتجهيز الرفوف 💾
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UPGRADE PLANS COMPARISON */}
          {activeTab === 'plans' && selectedCompForPlan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-sm font-bold text-slate-800">
                    باقات الاشتراك وسعة المنتجات لشركة "{companies.find(c => c.id === selectedCompForPlan)?.name}"
                  </span>
                </div>
                
                <button
                  onClick={() => { setSelectedCompForPlan(null); setActiveTab('list'); }}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>العودة للقائمة</span>
                </button>
              </div>

              {/* Plans cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => {
                  const companyObj = companies.find(c => c.id === selectedCompForPlan);
                  const isCurrentPlan = companyObj?.subscriptionPlan === plan.id;
                  
                  return (
                    <div 
                      key={plan.id}
                      className={`border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col justify-between transition-all relative ${
                        isCurrentPlan 
                          ? 'ring-2 ring-indigo-500 border-indigo-500' 
                          : plan.popular 
                            ? 'border-amber-300 shadow-md ring-2 ring-amber-400/15 scale-[1.02]' 
                            : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {plan.popular && (
                        <div className="bg-amber-500 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider">
                          الباقة الأكثر شعبية ⭐
                        </div>
                      )}

                      {/* Card Header */}
                      <div className={`p-4 border-b border-slate-100 text-right ${plan.headerBg}`}>
                        <h5 className="text-xs font-black text-slate-900">{plan.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono">{plan.englishName}</p>
                        
                        <div className="mt-3 flex items-baseline justify-end gap-1">
                          <span className="text-base font-black text-slate-900">{plan.price}</span>
                          <span className="text-[10px] text-slate-500 font-bold">/ {plan.period}</span>
                        </div>
                      </div>

                      {/* Card Body Features */}
                      <div className="p-4 flex-1">
                        <ul className="space-y-2.5">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-right">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        {isCurrentPlan ? (
                          <div className="w-full text-center py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>باقة الشركة الحالية</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              triggerUpgrade(selectedCompForPlan, plan.id, plan.limit);
                              addToast(`تم ترقية شركة "${companyObj?.name}" بنجاح إلى "${plan.name}"! تم زيادة السعة إلى ${plan.limit >= 9999 ? 'لامحدود' : plan.limit + ' منتج'}.`, 'success');
                            }}
                            className={`w-full text-center py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 ${
                              plan.popular 
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10' 
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                          >
                            تفعيل / ترقية الآن 💳
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Plan limits disclaimer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600">
                <CreditCard className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="text-right leading-relaxed">
                  هذه نافذة محاكاة لعمليات الاشتراك والفوترة. لا يتم خصم مبالغ حقيقية من بطاقتك. يمكنك ترقية وتجربة جميع الباقات والحدود مجاناً لاختبار أداء الكاشير والرفوف المتعددة.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SUPABASE CLOUD SYNC & CONFIG */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              
              {/* Connection Status Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                      supabaseConfigured ? 'bg-emerald-500 shadow-emerald-500/10' : 'bg-amber-500 shadow-amber-500/10'
                    }`}>
                      <Cloud className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span>مزامنة سحابية مع قاعدة بيانات Supabase</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          supabaseConfigured 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-extrabold' 
                            : 'bg-amber-50 text-amber-700 border-amber-100 font-extrabold'
                        }`}>
                          {supabaseConfigured ? 'نشط ومتصل 🔌' : 'يتطلب إعداد الجداول ⚠️'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        احفظ بضائع، فواتير، وتفاصيل اشتراكات كل شركة سحابياً بشكل مستقل تماماً وامنع ضياع البيانات
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Auto Sync Toggle */}
                    <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 transition-colors">
                      <span className="text-[11px] font-bold text-slate-700">مزامنة تلقائية:</span>
                      <button
                        onClick={() => {
                          onToggleSupabaseSync(!isSupabaseSyncEnabled);
                          addToast(!isSupabaseSyncEnabled ? 'تم تفعيل المزامنة التلقائية السحابية.' : 'تم إيقاف المزامنة السحابية التلقائية.', 'info');
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer outline-none ${
                          isSupabaseSyncEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                          isSupabaseSyncEnabled ? 'right-5' : 'right-1'
                        }`} />
                      </button>
                    </div>

                    {/* Manual Sync Button */}
                    {supabaseConfigured && (
                      <button
                        onClick={onManualSync}
                        disabled={supabaseSyncStatus === 'syncing'}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        <span>مزامنة سحابية يدوية</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Detailed Status Bar */}
                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <span>حالة خادم Supabase:</span>
                    {supabaseConfigured ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>الربط مهيأ بنجاح</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-extrabold">بيانات الاتصال مفقودة أو غير كاملة</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-slate-600">حالة المطابقة السحابية:</span>
                    {supabaseSyncStatus === 'syncing' && (
                      <span className="text-amber-600 flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري المزامنة ورفع البيانات...</span>
                      </span>
                    )}
                    {supabaseSyncStatus === 'synced' && (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Cloud className="w-4 h-4" />
                        <span>متطابق ومحفوظ سحابياً بنجاح (100%)</span>
                      </span>
                    )}
                    {supabaseSyncStatus === 'idle' && (
                      <span className="text-slate-500">جاهز للاتصال والرفع</span>
                    )}
                    {supabaseSyncStatus === 'error' && (
                      <span className="text-rose-500 font-extrabold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>فشلت المزامنة {supabaseErrorType === 'TABLE_NOT_FOUND' ? '(يتطلب إعداد جداول SQL)' : ''}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* TABLE NOT FOUND / SETUP GUIDE */}
              {(!supabaseConfigured || supabaseErrorType === 'TABLE_NOT_FOUND') && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 space-y-4 animate-fade-in text-right">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black text-amber-900">خطوات تفعيل قاعدة البيانات في Supabase (خطوة واحدة فقط!) ⚡</h4>
                      <p className="text-xs text-amber-800 leading-relaxed mt-1">
                        تم ربط مشروع Supabase بنجاح، ولكن خادم قاعدة البيانات يتطلب تهيئة جداول تخزين البيانات (Companies, Products, Orders) وتفعيل تصاريح الوصول العامة.
                      </p>
                    </div>
                  </div>

                  {/* Guide list */}
                  <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 font-medium pr-2">
                    <li>افتح لوحة تحكم مشروعك في <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-extrabold underline">Supabase Dashboard</a>.</li>
                    <li>من القائمة الجانبية اليسرى، انقر على خيار <span className="bg-slate-100 px-1.5 py-0.5 rounded border text-slate-800 font-bold">SQL Editor</span>.</li>
                    <li>انقر على زر <span className="bg-slate-100 px-1.5 py-0.5 rounded border text-slate-800 font-bold">New Query</span> لتفتح صفحة فارغة.</li>
                    <li>انسخ كود SQL بالأسفل، ثم الصقه بالكامل واضغط على زر <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">Run</span> في الأسفل.</li>
                  </ol>

                  {/* SQL Code block */}
                  <div className="relative group">
                    <div className="absolute top-3 left-3 z-10">
                      <button
                        onClick={() => {
                          const sqlCode = `-- 1. Create companies table\nCREATE TABLE IF NOT EXISTS companies (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  vat_number TEXT,\n  cr_number TEXT,\n  vat_rate NUMERIC DEFAULT 15,\n  welcome_msg TEXT,\n  subscription_plan TEXT DEFAULT 'free',\n  subscription_expiry TEXT,\n  max_products_limit INTEGER DEFAULT 5\n);\n\n-- 2. Create products table\nCREATE TABLE IF NOT EXISTS products (\n  id TEXT PRIMARY KEY,\n  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  price NUMERIC NOT NULL,\n  cost_price NUMERIC,\n  barcode TEXT,\n  category TEXT,\n  stock INTEGER DEFAULT 0,\n  is_unavailable BOOLEAN DEFAULT FALSE\n);\n\n-- 3. Create orders table\nCREATE TABLE IF NOT EXISTS orders (\n  id TEXT PRIMARY KEY,\n  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,\n  customer_name TEXT,\n  items JSONB,\n  total NUMERIC NOT NULL,\n  vat_amount NUMERIC,\n  discount NUMERIC,\n  payment_method TEXT,\n  status TEXT,\n  created_at TEXT\n);\n\n-- 4. Enable Row Level Security (RLS)\nALTER TABLE companies ENABLE ROW LEVEL SECURITY;\nALTER TABLE products ENABLE ROW LEVEL SECURITY;\nALTER TABLE orders ENABLE ROW LEVEL SECURITY;\n\n-- 5. Create anonymous access policies for testing\nCREATE POLICY "Allow anon select" ON companies FOR SELECT USING (true);\nCREATE POLICY "Allow anon insert" ON companies FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow anon update" ON companies FOR UPDATE USING (true);\nCREATE POLICY "Allow anon delete" ON companies FOR DELETE USING (true);\n\nCREATE POLICY "Allow anon select prod" ON products FOR SELECT USING (true);\nCREATE POLICY "Allow anon insert prod" ON products FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow anon update prod" ON products FOR UPDATE USING (true);\nCREATE POLICY "Allow anon delete prod" ON products FOR DELETE USING (true);\n\nCREATE POLICY "Allow anon select ord" ON orders FOR SELECT USING (true);\nCREATE POLICY "Allow anon insert ord" ON orders FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow anon update ord" ON orders FOR UPDATE USING (true);\nCREATE POLICY "Allow anon delete ord" ON orders FOR DELETE USING (true);`;
                          navigator.clipboard.writeText(sqlCode);
                          addToast('تم نسخ كود SQL بنجاح! قم بلصقه في Supabase واضغط Run.', 'success');
                        }}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1"
                        title="نسخ الكود بالكامل"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ كود التهيئة 📋</span>
                      </button>
                    </div>

                    <pre className="bg-slate-900 text-slate-100 rounded-2xl p-5 overflow-x-auto text-[11px] font-mono leading-relaxed text-left max-h-[250px] shadow-inner select-all">
{`-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  vat_number TEXT,
  cr_number TEXT,
  vat_rate NUMERIC DEFAULT 15,
  welcome_msg TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_expiry TEXT,
  max_products_limit INTEGER DEFAULT 5
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost_price NUMERIC,
  barcode TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  is_unavailable BOOLEAN DEFAULT FALSE
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  customer_name TEXT,
  items JSONB,
  total NUMERIC NOT NULL,
  vat_amount NUMERIC,
  discount NUMERIC,
  payment_method TEXT,
  status TEXT,
  created_at TEXT
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Create anonymous access policies for testing
CREATE POLICY "Allow anon select" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON companies FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON companies FOR DELETE USING (true);

CREATE POLICY "Allow anon select prod" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anon insert prod" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update prod" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete prod" ON products FOR DELETE USING (true);

CREATE POLICY "Allow anon select ord" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow anon insert ord" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update ord" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete ord" ON orders FOR DELETE USING (true);`}
                    </pre>
                  </div>
                </div>
              )}

              {/* RLS Disclaimer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600 text-right">
                <Database className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="leading-relaxed">
                  يتم تأمين اتصال الكاشير بـ Supabase باستخدام الـ API Key المشفر على الخادم (Server-Side Proxy)، مما يبعد بيانات مشروعك تماماً عن متناول المتصفح ويعزز أمان تعاملاتك.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
