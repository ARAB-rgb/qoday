import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Key, Clock, Award, BarChart3, TrendingUp, CheckCircle, 
  Lock, ArrowRight, ShieldAlert, Sparkles, Building2, UserCheck, Eye, EyeOff, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, POSUser, Order } from '../types';
import { AVAILABLE_PERMISSIONS } from './AuthAndUserManager';

interface UserProfileModalProps {
  onClose: () => void;
  currentUser: POSUser;
  setCurrentUser: (user: POSUser) => void;
  companies: Company[];
  orders: Order[];
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onLogout?: () => void;
}

export function UserProfileModal({
  onClose,
  currentUser,
  setCurrentUser,
  companies,
  orders,
  addToast,
  onLogout
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'stats' | 'security'>('profile');
  
  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Real-time Shift duration state
  const [sessionStart, setSessionStart] = useState<string>(() => {
    let saved = localStorage.getItem(`pos_session_start_${currentUser.id}`);
    if (!saved) {
      saved = new Date().toISOString();
      localStorage.setItem(`pos_session_start_${currentUser.id}`, saved);
    }
    return saved;
  });
  
  const [elapsedTimeStr, setElapsedTimeStr] = useState('00:00:00');

  useEffect(() => {
    const updateElapsed = () => {
      const start = new Date(sessionStart).getTime();
      const now = Date.now();
      const diffMs = now - start;
      if (diffMs < 0) return;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const pad = (num: number) => String(num).padStart(2, '0');
      setElapsedTimeStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Find active company
  const activeCompanyId = localStorage.getItem('pos_current_company_id');
  const activeCompany = companies.find(c => c.id === activeCompanyId);

  // Statistics calculation for this user
  // (Filter orders where cashierId matches or if none matches, default to all orders processed today)
  const userOrders = orders.filter(o => {
    const isToday = new Date(o.timestamp).toDateString() === new Date().toDateString();
    return isToday && (!o.cashierId || o.cashierId === currentUser.id);
  });

  const totalSalesCount = userOrders.length;
  const totalSalesAmount = userOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderVal = totalSalesCount > 0 ? (totalSalesAmount / totalSalesCount) : 0;

  // Handler to change user's own password
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      addToast('يرجى تعبئة جميع حقول تعديل الرمز السري', 'warning');
      return;
    }

    if (currentUser.password && currentPasswordInput !== currentUser.password) {
      addToast('كلمة المرور الحالية غير صحيحة!', 'error');
      return;
    }

    if (newPassword.length < 4) {
      addToast('يجب أن تكون كلمة المرور الجديدة مكونة من 4 خانات على الأقل', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('كلمة المرور الجديدة غير متطابقة مع التأكيد!', 'error');
      return;
    }

    // Save user password update to local storage list of users
    try {
      const savedUsersStr = localStorage.getItem('pos_system_users');
      if (savedUsersStr) {
        const allUsers: POSUser[] = JSON.parse(savedUsersStr);
        const updatedUsers = allUsers.map(u => {
          if (u.id === currentUser.id) {
            return { ...u, password: newPassword };
          }
          return u;
        });
        localStorage.setItem('pos_system_users', JSON.stringify(updatedUsers));
      }

      // Update current active user context
      const updatedUser: POSUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      localStorage.setItem('pos_current_user', JSON.stringify(updatedUser));

      addToast('تم تغيير كلمة المرور الشخصية بنجاح 🔒', 'success');
      
      // Clear inputs
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast('حدث خطأ أثناء حفظ كلمة المرور الجديدة', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-3xl h-[80vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
      >
        {/* Profile Custom Header */}
        <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 text-xl font-black shadow-inner">
              {currentUser.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">{currentUser.name}</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  متصل الآن
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{activeCompany ? activeCompany.name : 'قيد للبرمجيات'}</span>
                <span>•</span>
                <span>@{currentUser.username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/30 flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </header>

        {/* Modal Inner Tab Links */}
        <div className="flex border-b border-slate-150 bg-slate-50/70 px-6 shrink-0 scrollbar-none overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>بيانات الموظف والوردية</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'permissions'
                ? 'border-indigo-600 text-indigo-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>الميزات وصلاحيات العمل</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
              {currentUser.permissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stats'
                ? 'border-indigo-600 text-indigo-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>إحصائيات الكاشير اليومية</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>تحديث كلمة المرور شخصياً</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: PROFILE & ACTIVE SHIFT */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-black text-slate-800">تفاصيل الحساب الفعّال</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">الاسم الكامل:</span>
                        <span className="text-slate-800 font-extrabold">{currentUser.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">اسم المستخدم:</span>
                        <span className="text-slate-800 font-mono font-bold">@{currentUser.username}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">مستوى الصلاحية (الدور):</span>
                        <span className="text-indigo-600 font-extrabold bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                          {currentUser.role === 'admin' ? 'مشرف كاشير عام' : currentUser.role === 'manager' ? 'مدير مخازن' : 'كاشير مبيعات'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">الحالة الفنية:</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          نشط ومعتمد نظاماً
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shift Duration Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-3 border-b border-indigo-100/50">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs font-black text-slate-800">بيانات الوردية والعمل اليومي</h3>
                      </div>

                      <div className="space-y-3 pt-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">وقت بدء تسجيل الدخول:</span>
                          <span className="text-slate-700 font-bold">
                            {new Date(sessionStart).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">تاريخ الوردية الحالية:</span>
                          <span className="text-slate-700 font-bold">
                            {new Date(sessionStart).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-4 bg-white/80 border border-indigo-100 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">الزمن المنقضي في الوردية</span>
                      <span className="text-2xl font-mono font-black text-indigo-600 tracking-wider">
                        {elapsedTimeStr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info alert banner */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-950 flex gap-3 text-xs leading-relaxed">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-extrabold">🚨 حماية أمن الوردية والعمليات</p>
                    <p className="text-slate-600 text-[11px]">
                      تذكر دائماً تسجيل خروجك الفوري بالضغط على زر "خروج" عند مغادرتك لجهاز الكاشير لتجنب تسجيل الفواتير والمبيعات باسم حسابك الشخصي من قبل مستخدمين آخرين.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: ACTIVE PERMISSIONS CHECKLIST */}
            {activeTab === 'permissions' && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white p-4 rounded-xl border border-slate-150 mb-2">
                  <h3 className="text-xs font-black text-slate-800">الميزات ومستويات صلاحيات العمل الممنوحة لك ⚙️</h3>
                  <p className="text-[11px] text-slate-400 mt-1">توضح هذه الشاشة الأدوات والأجزاء المفعلة والمقفلة لحساب الموظف الحالي في منظومة قيد (QAYD) الذكية:</p>
                </div>

                <div className="space-y-3">
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const isGranted = currentUser.permissions.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
                          isGranted 
                            ? 'bg-emerald-50/10 border-emerald-200' 
                            : 'bg-slate-50/50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isGranted 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {isGranted ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{p.name}</span>
                            {isGranted ? (
                              <span className="text-[8.5px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                                ميزة مفعّلة لك
                              </span>
                            ) : (
                              <span className="text-[8.5px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                                غير مفعّلة (مغلقة)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 3: DAILY PERFORMANCE STATISTICS */}
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="bg-white p-4 rounded-xl border border-slate-150">
                  <h3 className="text-xs font-black text-slate-800">معدل أدائك ومبيعاتك المنفذة اليوم</h3>
                  <p className="text-[11px] text-slate-400 mt-1">تتبع العمليات التي قمت بتأكيدها وطباعة فواتيرها بنجاح منذ بداية ورديتك الحالية اليوم:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-150 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 rounded-bl-3xl flex items-center justify-center text-indigo-500">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">مبيعات الوردية الإجمالية</span>
                    <span className="text-xl font-mono font-black text-slate-800 block">
                      {totalSalesAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 mt-1 block">ريال سعودي</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-150 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 rounded-bl-3xl flex items-center justify-center text-indigo-500">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">عدد الفواتير الصادرة باسمك</span>
                    <span className="text-xl font-mono font-black text-slate-800 block">
                      {totalSalesCount}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 mt-1 block">فاتورة مؤكدة</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-150 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 rounded-bl-3xl flex items-center justify-center text-indigo-500">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">متوسط قيمة السلة / الفاتورة</span>
                    <span className="text-xl font-mono font-black text-slate-800 block">
                      {averageOrderVal.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 mt-1 block">ريال للفاتورة الواحدة</span>
                  </div>
                </div>

                {/* visual chart indicator */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-3">
                  <span className="text-xs font-black text-slate-800 block">تقدم أداء الكاشير اليومي مقارنة بالمستهدف (1000 ريال)</span>
                  
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalSalesAmount / 1000) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>البداية (0 ريال)</span>
                    <span className="text-indigo-600 font-extrabold">
                      تم تحقيق {((totalSalesAmount / 1000) * 100).toFixed(0)}% من المستهدف اليومي
                    </span>
                    <span>المستهدف (1000 ريال)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: PASSWORD SECURITY MANAGEMENT */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white p-4 rounded-xl border border-slate-150 mb-2">
                  <h3 className="text-xs font-black text-slate-800">تحديث كلمة المرور الشخصية لحسابك 🔒</h3>
                  <p className="text-[11px] text-slate-400 mt-1">لحماية بياناتك، يرجى الحفاظ على سرية رمز الدخول الخاص بك وتغييره دورياً لمنع دخول الآخرين باسمك:</p>
                </div>

                <form onSubmit={handlePasswordChange} className="bg-white p-5 border border-slate-150 rounded-2xl space-y-4 shadow-sm text-right">
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رمز المرور الحالي الخاص بك:</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="أدخل كلمة المرور الحالية"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رمز المرور الجديد:</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="لا يقل عن 4 أرقام أو حروف"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">تأكيد رمز المرور الجديد:</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="أعد إدخال رمز المرور الجديد للتأكيد"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                  >
                    <Key className="w-4 h-4" />
                    <span>تحديث وحفظ كلمة المرور السرية 🔒</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
