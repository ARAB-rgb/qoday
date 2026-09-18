import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, UserPlus, Users, Eye, Shield, CheckCircle, 
  Trash2, Plus, Sliders, LogOut, X, Key, Building, Check,
  AlertTriangle, EyeOff, ShieldCheck, ClipboardList, HelpCircle, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, POSUser } from '../types';

// Default initial users to seed local storage if empty
const INITIAL_USERS: POSUser[] = [
  {
    id: 'user-default-admin',
    name: 'مشرف الدعم الموحد (قيود)',
    username: '1007363904',
    password: '139213',
    role: 'admin',
    status: 'active',
    companyId: 'qayd_support',
    permissions: ['sell', 'inventory', 'reports', 'settings', 'users']
  },
  {
    id: 'user-comp1-admin',
    name: 'أدمن مؤسسة قيد',
    username: 'admin_comp1',
    password: '123',
    role: 'admin',
    status: 'active',
    companyId: 'comp-1',
    permissions: ['sell', 'inventory', 'reports', 'settings', 'users']
  },
  {
    id: 'user-default-cashier',
    name: 'سارة الكاشير',
    username: 'sara_cashier',
    password: '123',
    role: 'cashier',
    status: 'active',
    companyId: 'comp-1',
    permissions: ['sell']
  },
  {
    id: 'user-comp2-admin',
    name: 'أدمن مخابز الياسمين',
    username: 'admin_comp2',
    password: '123',
    role: 'admin',
    status: 'active',
    companyId: 'comp-2',
    permissions: ['sell', 'inventory', 'reports', 'settings', 'users']
  },
  {
    id: 'user-comp2-cashier',
    name: 'أحمد الياسمين',
    username: 'ahmed_yasmine',
    password: '123',
    role: 'cashier',
    status: 'active',
    companyId: 'comp-2',
    permissions: ['sell']
  },
  {
    id: 'user-comp3-admin',
    name: 'أدمن النخبة الراقية',
    username: 'admin_comp3',
    password: '123',
    role: 'admin',
    status: 'active',
    companyId: 'comp-3',
    permissions: ['sell', 'inventory', 'reports', 'settings', 'users']
  }
];

// All available permissions/features in the system
export const AVAILABLE_PERMISSIONS = [
  { id: 'sell', name: 'إتمام عمليات البيع وتأكيد الفواتير', desc: 'يسمح للمستخدم بإضافة المنتجات للسلة وإتمام الكاشير وطباعة الفاتورة.', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'inventory', name: 'إدارة المنتجات وتصنيفات السلع والمخزون', desc: 'يسمح بإضافة وتعديل المنتجات والأسعار والتصنيفات في لوحة التحكم.', color: 'text-blue-600 bg-blue-50' },
  { id: 'reports', name: 'استعراض التقارير المالية والأرباح', desc: 'يسمح بعرض المبيعات والأرباح وإحصائيات أداء المبيعات اليومية.', color: 'text-amber-600 bg-amber-50' },
  { id: 'settings', name: 'تعديل الإعدادات والضرائب وأجهزة السوبرماركت', desc: 'يسمح بتغيير اسم المحل والضريبة وبيانات المطبوعات وإعدادات الأجهزة.', color: 'text-purple-600 bg-purple-50' },
  { id: 'users', name: 'إدارة المستخدمين والمشتركين وصلاحيات الميزات', desc: 'يسمح بتسجيل مستخدمين جدد، إيقافهم، رؤية المشتركين، وتعديل الميزات.', color: 'text-rose-600 bg-rose-50' }
];

// ==========================================
// 1. FULL-SCREEN LOGIN / REGISTRATION SCREEN
// ==========================================
interface LoginScreenProps {
  onLoginSuccess: (user: POSUser) => void;
  companies: Company[];
}

export function LoginScreen({ onLoginSuccess, companies }: LoginScreenProps) {
  const [users, setUsers] = useState<POSUser[]>(() => {
    const saved = localStorage.getItem('pos_system_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activeMode, setActiveMode] = useState<'login' | 'register_admin' | 'register_user'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'cashier' | 'manager'>('cashier');
  const [regPermissions, setRegPermissions] = useState<string[]>(['sell']);
  const [regCompanyId, setRegCompanyId] = useState<string>(companies[0]?.id || 'comp-1');

  // Sync users to storage whenever they change
  useEffect(() => {
    localStorage.setItem('pos_system_users', JSON.stringify(users));
  }, [users]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    // Find user
    const foundUser = users.find(u => u.username === trimmedUsername);

    if (!foundUser) {
      setError('خطأ: اسم المستخدم غير مسجل بالنظام');
      return;
    }

    if (foundUser.status === 'suspended') {
      setError('هذا الحساب موقوف حالياً، الرجاء مراجعة مدير النظام');
      return;
    }

    if (foundUser.password !== trimmedPassword) {
      setError('كلمة المرور غير صحيحة، حاول مجدداً');
      return;
    }

    // Success login
    setSuccess(`أهلاً بك مجدداً ${foundUser.name}! جاري الدخول...`);
    setTimeout(() => {
      onLoginSuccess(foundUser);
    }, 1000);
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // Check duplicate
    if (users.some(u => u.username === regUsername.trim())) {
      setError('اسم المستخدم هذا محجوز بالفعل لموظف آخر!');
      return;
    }

    const newAdminUser: POSUser = {
      id: 'user-' + Date.now(),
      name: regName.trim(),
      username: regUsername.trim(),
      password: regPassword.trim(),
      role: 'admin',
      status: 'active',
      permissions: ['sell', 'inventory', 'reports', 'settings', 'users'],
      companyId: regCompanyId
    };

    setUsers(prev => [...prev, newAdminUser]);
    setSuccess('تم تسجيل حساب الأدمن المشرف الجديد بنجاح! يمكنك الدخول الآن.');
    
    // Switch to login and fill
    setTimeout(() => {
      setUsername(newAdminUser.username);
      setPassword(newAdminUser.password || '');
      setActiveMode('login');
      setSuccess('');
    }, 2000);
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // Check duplicate
    if (users.some(u => u.username === regUsername.trim())) {
      setError('اسم المستخدم هذا محجوز بالفعل لموظف آخر!');
      return;
    }

    const newUser: POSUser = {
      id: 'user-' + Date.now(),
      name: regName.trim(),
      username: regUsername.trim(),
      password: regPassword.trim(),
      role: regRole,
      status: 'active',
      permissions: regPermissions,
      companyId: regCompanyId
    };

    setUsers(prev => [...prev, newUser]);
    setSuccess(`تم تسجيل الموظف الجديد "${regName}" بنجاح!`);
    
    setTimeout(() => {
      setUsername(newUser.username);
      setPassword(newUser.password || '');
      setActiveMode('login');
      setSuccess('');
    }, 2000);
  };

  const togglePermission = (id: string) => {
    setRegPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900 flex items-center justify-center p-4 font-sans text-right" dir="rtl" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.08), transparent)' }}>
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Floating circles decoration */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

        {/* Brand Header */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-800">منظومة كاشير قيد الذكية (QAYD)</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">بوابة كاشير الفوترة والدخول الموحد</p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 shrink-0">
          <button 
            onClick={() => { setActiveMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeMode === 'login' ? 'bg-white text-indigo-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            تسجيل الدخول للكاشير
          </button>
          <button 
            onClick={() => { setActiveMode('register_admin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeMode === 'register_admin' ? 'bg-white text-indigo-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            تسجيل مشرف (أدمن)
          </button>
          <button 
            onClick={() => { setActiveMode('register_user'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeMode === 'register_user' ? 'bg-white text-indigo-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            تسجيل موظف جديد
          </button>
        </div>

        {/* Display Messages */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2 font-bold justify-end shrink-0">
            <span>{error}</span>
            <AlertTriangle className="w-4 h-4 shrink-0" />
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-bold justify-end shrink-0">
            <span>{success}</span>
            <CheckCircle className="w-4 h-4 shrink-0" />
          </div>
        )}

        {/* Interactive Forms */}
        <div className="flex-1 overflow-y-auto pr-1 pb-4">
          <AnimatePresence mode="wait">
            
            {/* A. LOGIN FORM */}
            {activeMode === 'login' && (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit} 
                className="space-y-4 text-right"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">اسم المستخدم (المعرف الوطني أو الكود):</label>
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم مثل: 1007363904"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">كلمة المرور السرية:</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور مثل: 139213"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl pr-4 pl-10 py-2.5 text-xs text-slate-800 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>دخول آمن كاشير / مشرف 🛡️</span>
                </button>
              </motion.form>
            )}

            {/* B. REGISTER ADMIN FORM */}
            {activeMode === 'register_admin' && (
              <motion.form 
                key="reg_admin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRegisterAdmin} 
                className="space-y-4 text-right"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">اختر المنشأة / الشركة التابع لها: 🏢</label>
                  <select
                    value={regCompanyId}
                    onChange={(e) => setRegCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">الاسم الكامل للمشرف:</label>
                  <input 
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: صالح الودعاني"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">اسم مستخدم الأدمن الفريد:</label>
                  <input 
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="مثال: UserAdmin77"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">كلمة المرور المشفرة:</label>
                  <input 
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono font-bold"
                  />
                </div>

                <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed space-y-1">
                  <div className="font-extrabold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>صلاحيات باقة المشرف (Admin):</span>
                  </div>
                  <p className="text-slate-600 text-[10px]">
                    سيمتلك هذا الحساب كافة صلاحيات النظام بما في ذلك تعديل قائمة السلع، رؤية التقارير، تسجيل الموظفين الآخرين وإلغائهم.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد تسجيل حساب مشرف (أدمن) 🛡️</span>
                </button>
              </motion.form>
            )}

            {/* C. REGISTER USER / CASHIER FORM */}
            {activeMode === 'register_user' && (
              <motion.form 
                key="reg_user"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRegisterUser} 
                className="space-y-4 text-right"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">اختر المنشأة / الشركة التابع لها الموظف: 🏢</label>
                  <select
                    value={regCompanyId}
                    onChange={(e) => setRegCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold mb-4"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">اسم الموظف الثنائي:</label>
                    <input 
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="مثال: فهد الحربي"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">نوع ومسمى الوظيفة:</label>
                    <select
                      value={regRole}
                      onChange={(e) => {
                        const role = e.target.value as 'admin' | 'cashier' | 'manager';
                        setRegRole(role);
                        if (role === 'admin' || role === 'manager') {
                          setRegPermissions(['sell', 'inventory', 'reports']);
                        } else {
                          setRegPermissions(['sell']);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-700 font-bold"
                    >
                      <option value="cashier">كاشير مبيعات (Cashier)</option>
                      <option value="manager">مدير فرع / مخزن (Manager)</option>
                      <option value="admin">مشرف إداري (Admin)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">اسم المستخدم للدخول:</label>
                    <input 
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="مثال: fahad_pos"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">رمز المرور الخاص به:</label>
                    <input 
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Permissions Customizer - Answers "واضاف الميزات التي يعمل بها المستخدمة" */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 block">تخصيص الميزات والصلاحيات التي يعمل بها المستخدم ⚙️</label>
                  <p className="text-[10px] text-slate-500 leading-none">حدد الميزات التي سيُسمح للموظف باستخدامها والدخول إليها في المنظومة:</p>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                    {AVAILABLE_PERMISSIONS.map(p => {
                      const isChecked = regPermissions.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`p-2.5 border rounded-xl flex items-start gap-2.5 transition-all cursor-pointer select-none ${isChecked ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white hover:bg-slate-50 border-slate-100'}`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-[11px] font-bold text-slate-800 block">{p.name}</span>
                            <p className="text-[9px] text-slate-400 font-medium leading-normal">{p.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد تسجيل الحساب للموظف</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MODAL FOR MANAGING EMPLOYEES & SUBSCRIBERS
// ==========================================
interface AuthAndUserManagerModalProps {
  onClose: () => void;
  currentUser: POSUser;
  companies: Company[];
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onUpdateCompanies: (updated: Company[]) => void;
  onChangeCompany?: (companyId: string) => void;
  onLogout?: () => void;
}

export function AuthAndUserManagerModal({ 
  onClose, 
  currentUser, 
  companies, 
  addToast,
  onUpdateCompanies,
  onChangeCompany,
  onLogout
}: AuthAndUserManagerModalProps) {
  const isQaydAdmin = currentUser.username === '1007363904';
  const [activeTab, setActiveTab] = useState<'subscribers' | 'add_company' | 'users_passwords'>(
    isQaydAdmin ? 'subscribers' : 'users_passwords'
  );
  
  // Subscriber list state filter: 'all' = Active/All, 'expired' = Expired/Inactive, 'trial' = Trial/Free
  const [subFilter, setSubFilter] = useState<'all' | 'expired' | 'trial'>('all');

  const [users, setUsers] = useState<POSUser[]>(() => {
    const saved = localStorage.getItem('pos_system_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  // Editing user passwords state
  const [editingPasswords, setEditingPasswords] = useState<Record<string, string>>({});

  // Add User Form States
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addUserName, setAddUserName] = useState('');
  const [addUserUsername, setAddUserUsername] = useState('');
  const [addUserPassword, setAddUserPassword] = useState('');
  const [addUserRole, setAddUserRole] = useState<'admin' | 'cashier' | 'manager'>('cashier');
  const [addUserPermissions, setAddUserPermissions] = useState<string[]>(['sell']);
  const [addUserCompanyId, setAddUserCompanyId] = useState('');

  useEffect(() => {
    if (isQaydAdmin) {
      setAddUserCompanyId(companies[0]?.id || 'comp-1');
    } else {
      setAddUserCompanyId(currentUser.companyId || 'comp-1');
    }
  }, [currentUser, companies, isQaydAdmin]);

  // Sync users to storage whenever they change
  useEffect(() => {
    localStorage.setItem('pos_system_users', JSON.stringify(users));
  }, [users]);

  // Subscriber company creation inputs
  const [newCompName, setNewCompName] = useState('');
  const [newCompPlan, setNewCompPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('basic');
  const [newCompExpiry, setNewCompExpiry] = useState('');
  const [newCompCr, setNewCompCr] = useState('');
  const [newCompVat, setNewCompVat] = useState('');

  // Handler to update a user's password/secret code
  const handleUpdateUserPassword = (userId: string, userName: string) => {
    const newPass = editingPasswords[userId];
    if (!newPass || newPass.trim().length < 3) {
      addToast('يرجى إدخال رقم سري صحيح يتكون من 3 خانات أو أكثر', 'warning');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addToast(`تم تحديث الرمز السري للموظف "${userName}" بنجاح 🔑`, 'success');
        return { ...u, password: newPass.trim() };
      }
      return u;
    }));

    // Clear password edit state for this user
    setEditingPasswords(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  // Handler to delete a user
  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === currentUser.id) {
      addToast('لا يمكنك حذف حسابك الحالي الذي تعمل به!', 'error');
      return;
    }
    const confirmed = window.confirm(`هل أنت متأكد من رغبتك في حذف الموظف "${name}" نهائياً من قاعدة البيانات؟`);
    if (!confirmed) return;

    setUsers(prev => prev.filter(u => u.id !== userId));
    addToast(`تم حذف الموظف "${name}" بنجاح 🗑️`, 'success');
  };

  // Handler to toggle active/suspended status
  const handleToggleUserStatus = (userId: string, name: string, currentStatus: 'active' | 'suspended') => {
    if (userId === currentUser.id) {
      addToast('لا يمكنك تعليق حسابك الخاص!', 'error');
      return;
    }
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addToast(
          nextStatus === 'active' 
            ? `تم إلغاء تفعيل تعليق الموظف "${name}" وحسابه نشط مجدداً 🟢` 
            : `تم تعليق الموظف "${name}" وإيقاف وصوله لنقاط البيع مؤقتاً 🔴`, 
          'info'
        );
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Handler to submit new user addition
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserName.trim() || !addUserUsername.trim() || !addUserPassword.trim()) {
      addToast('الرجاء تعبئة كافة الحقول المطلوبة لتسجيل الموظف الجديد', 'warning');
      return;
    }
    if (users.some(u => u.username === addUserUsername.trim())) {
      addToast('اسم المستخدم هذا محجوز بالفعل لموظف آخر بالمنظومة!', 'error');
      return;
    }

    const newUserObj: POSUser = {
      id: 'user-' + Date.now(),
      name: addUserName.trim(),
      username: addUserUsername.trim(),
      password: addUserPassword.trim(),
      role: addUserRole,
      status: 'active',
      permissions: addUserPermissions,
      companyId: isQaydAdmin ? addUserCompanyId : (currentUser.companyId || 'comp-1')
    };

    setUsers(prev => [...prev, newUserObj]);
    addToast(`تم إضافة وتسجيل الموظف الجديد "${addUserName}" بنجاح 🚀`, 'success');

    // Reset fields
    setAddUserName('');
    setAddUserUsername('');
    setAddUserPassword('');
    setAddUserRole('cashier');
    setAddUserPermissions(['sell']);
    setShowAddUserForm(false);
  };

  const toggleNewUserPermission = (permId: string) => {
    if (addUserPermissions.includes(permId)) {
      setAddUserPermissions(prev => prev.filter(p => p !== permId));
    } else {
      setAddUserPermissions(prev => [...prev, permId]);
    }
  };

  // Add Company Form Submit handler
  const handleAddCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) {
      addToast('يرجى إدخال اسم المؤسسة المالي', 'warning');
      return;
    }

    const planLimits = {
      free: 5,
      basic: 25,
      premium: 100,
      enterprise: 9999
    };

    const newCompany: Company = {
      id: 'comp-' + Date.now(),
      name: newCompName.trim(),
      vatNumber: newCompVat.trim() || ('3000554433' + Math.floor(10000 + Math.random() * 90000)),
      crNumber: newCompCr.trim() || ('1010' + Math.floor(100000 + Math.random() * 900000)),
      vatRate: 15,
      welcomeMsg: `أهلاً بكم في ${newCompName.trim()}! نشكر تسوقكم معنا.`,
      subscriptionPlan: newCompPlan,
      subscriptionExpiry: newCompExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxProductsLimit: planLimits[newCompPlan],
      isActive: true
    };

    onUpdateCompanies([...companies, newCompany]);
    addToast(`تم تسجيل المشترك الجديد "${newCompName}" وتفعيل باقة ${newCompPlan} له بنجاح 🚀`, 'success');
    
    // Reset inputs & switch tab
    setNewCompName('');
    setNewCompPlan('basic');
    setNewCompExpiry('');
    setNewCompCr('');
    setNewCompVat('');
    setActiveTab('subscribers');
  };

  const handleToggleCompanyStatus = (companyId: string, name: string, currentStatus: boolean | undefined) => {
    const updated = companies.map(c => {
      if (c.id === companyId) {
        const nextStatus = currentStatus === false;
        addToast(
          nextStatus 
            ? `تم إلغاء تفعيل تعليق المنشأة "${name}" والاشتراك نشط مجدداً 🟢` 
            : `تم تعليق منشأة المشترك "${name}" وإيقاف مبيعات الكاشير مؤقتاً 🔴`, 
          'info'
        );
        return { ...c, isActive: nextStatus };
      }
      return c;
    });
    onUpdateCompanies(updated);
  };

  const handleDeleteCompany = (companyId: string, name: string) => {
    const confirmed = window.confirm(`هل أنت متأكد من رغبتك في حذف المنشأة "${name}" نهائياً من قائمة المشتركين؟`);
    if (!confirmed) return;

    const updated = companies.filter(c => c.id !== companyId);
    onUpdateCompanies(updated);
    addToast(`تم حذف المشترك "${name}" بنجاح 🗑️`, 'success');
  };

  // Stats for counters
  const totalSubscribersCount = companies.length;
  const expiredSubscribersCount = companies.filter(c => new Date(c.subscriptionExpiry) < new Date() || c.isActive === false).length;
  const trialSubscribersCount = companies.filter(c => c.subscriptionPlan === 'free').length;

  // Filtered subscribers list
  const filteredCompanies = companies.filter(comp => {
    const isExpired = new Date(comp.subscriptionExpiry) < new Date() || comp.isActive === false;
    const isTrial = comp.subscriptionPlan === 'free';

    if (subFilter === 'expired') {
      return isExpired;
    }
    if (subFilter === 'trial') {
      return isTrial;
    }
    return true; // all
  });

  return (
    <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4 font-sans text-right animate-fade-in" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
      >
        
        {/* Modal Top Header */}
        <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">لوحة الإشراف والمشتركين الفنية 🛡️</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">البوابة الحصرية لإدارة اشتراكات المنشآت والشركات وتحديث الرموز السرية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-500/30 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs bar inside Modal */}
        <div className="flex border-b border-slate-150 px-6 bg-slate-50/50 shrink-0 overflow-x-auto scrollbar-none">
          {isQaydAdmin && (
            <>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'subscribers'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>المشتركون والمؤسسات</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                  {totalSubscribersCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('add_company')}
                className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'add_company'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة شركة / منشأة جديدة</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('users_passwords')}
            className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'users_passwords'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isQaydAdmin ? 'الأرقام والرموز السرية لكافة الموظفين' : 'إدارة موظفي المنشأة والأرقام السرية 👥'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
              {isQaydAdmin ? users.length : users.filter(u => u.companyId === currentUser.companyId).length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          
          {/* TAB 1: SUBSCRIBERS LIST (With active, expired, trial filters) */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Quick status counters and filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setSubFilter('all')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                    subFilter === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <Building className={`w-5 h-5 mb-1 ${subFilter === 'all' ? 'text-indigo-200' : 'text-indigo-600'}`} />
                  <span className={`text-[10px] block font-bold uppercase tracking-wider ${subFilter === 'all' ? 'text-indigo-100' : 'text-slate-400'}`}>
                    المشتركون الفعّالون والكل
                  </span>
                  <span className="text-xl font-mono font-black mt-0.5 block">{totalSubscribersCount}</span>
                </button>

                <button
                  onClick={() => setSubFilter('expired')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                    subFilter === 'expired'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 mb-1 ${subFilter === 'expired' ? 'text-rose-200' : 'text-rose-600'}`} />
                  <span className={`text-[10px] block font-bold uppercase tracking-wider ${subFilter === 'expired' ? 'text-rose-100' : 'text-slate-400'}`}>
                    الاشتراكات المنتهية والملغية ⚠️
                  </span>
                  <span className="text-xl font-mono font-black mt-0.5 block">{expiredSubscribersCount}</span>
                </button>

                <button
                  onClick={() => setSubFilter('trial')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                    subFilter === 'trial'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/10'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <ClipboardList className={`w-5 h-5 mb-1 ${subFilter === 'trial' ? 'text-purple-200' : 'text-purple-600'}`} />
                  <span className={`text-[10px] block font-bold uppercase tracking-wider ${subFilter === 'trial' ? 'text-purple-100' : 'text-slate-400'}`}>
                    باقات التجربة المجانية 🧪
                  </span>
                  <span className="text-xl font-mono font-black mt-0.5 block">{trialSubscribersCount}</span>
                </button>
              </div>

              {/* Header Title */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-800">
                  {subFilter === 'all' && 'قائمة كافة الشركات والمنشآت المسجلة'}
                  {subFilter === 'expired' && 'سجل المنشآت منتهية الصلاحية أو المعلقة ⚠️'}
                  {subFilter === 'trial' && 'الشركات المفعلة تحت الباقة التجريبية المجانية 🧪'}
                </h3>
                <p className="text-[11px] text-slate-500">تم الفرز بناءً على التبويب المختار أعلاه لمراجعة اشتراكات قيد الفعالة.</p>
              </div>

              {/* Subscribers Table List */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                      <tr>
                        <th className="px-5 py-3.5">اسم المؤسسة (المشترك)</th>
                        <th className="px-5 py-3.5">السجل والرقم الضريبي</th>
                        <th className="px-5 py-3.5">باقة الفوترة</th>
                        <th className="px-5 py-3.5">تاريخ انتهاء الاشتراك</th>
                        <th className="px-5 py-3.5 text-center">الإجراءات والترخيص</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredCompanies.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-bold">
                            لا توجد أي منشآت أو شركات مسجلة تحت هذا الفرز حالياً.
                          </td>
                        </tr>
                      ) : (
                        filteredCompanies.map(comp => {
                          const isExpired = new Date(comp.subscriptionExpiry) < new Date();
                          const isSuspended = comp.isActive === false;

                          return (
                            <tr key={comp.id} className={`hover:bg-slate-50/50 transition-all ${isSuspended ? 'bg-rose-50/15' : ''}`}>
                              <td className="px-5 py-4">
                                <span className="font-extrabold text-slate-900 block text-sm">{comp.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9.5px] text-slate-400 font-mono">ID: {comp.id}</span>
                                  {comp.supportRequested && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[8.5px] font-black animate-pulse">
                                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                      <span>مطلوب دعم فني ⚠️</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 font-mono text-[10.5px]">
                                <div>س.ت: {comp.crNumber || '1010XXXXXX'}</div>
                                <div className="text-slate-400 mt-0.5">الرقم الضريبي: {comp.vatNumber || 'غير متوفر'}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                  comp.subscriptionPlan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                  comp.subscriptionPlan === 'premium' ? 'bg-amber-100 text-amber-700' :
                                  comp.subscriptionPlan === 'basic' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {comp.subscriptionPlan === 'enterprise' ? 'الأعمال اللامحدودة' :
                                   comp.subscriptionPlan === 'premium' ? 'الذهبية للمحلات' :
                                   comp.subscriptionPlan === 'basic' ? 'التموينات الأساسية' : 'باقة التجربة 🧪'}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className={`font-mono font-semibold ${isExpired ? 'text-rose-500 font-extrabold' : 'text-slate-600'}`}>
                                  {comp.subscriptionExpiry}
                                </div>
                                {isExpired && <span className="text-[9px] text-rose-500 font-bold block mt-0.5">منتهية ⚠️</span>}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {onChangeCompany && (
                                    <button
                                      onClick={() => {
                                        onChangeCompany(comp.id);
                                        addToast(`تم الدخول بنجاح لمؤسسة "${comp.name}" كدعم فني فوري 🛠️`, 'success');
                                        onClose();
                                      }}
                                      className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] rounded-lg font-black transition-all cursor-pointer flex items-center gap-1"
                                      title="تسجيل دخول مباشر كمسؤول دعم فني"
                                    >
                                      <LogIn className="w-3.5 h-3.5" />
                                      <span>دخول دعم 🛠️</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleToggleCompanyStatus(comp.id, comp.name, comp.isActive)}
                                    className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer border ${
                                      isSuspended
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                    }`}
                                  >
                                    {isSuspended ? 'تنشيط' : 'تعليق'}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteCompany(comp.id, comp.name)}
                                    className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                                    title="حذف المشترك نهائياً"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW COMPANY FORM (إضافة منشأة جديدة) */}
          {activeTab === 'add_company' && (
            <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-indigo-950 space-y-1">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>بوابة تسجيل الشركات والمنشآت الذكية</span>
                </h4>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  قم بتسجيل وتوثيق المنشأة الجديدة لإتاحة الفوترة ونقاط البيع لها بشكل مخصص وفوري في منظومة قيد الموحدة.
                </p>
              </div>

              <form onSubmit={handleAddCompanySubmit} className="bg-white p-6 border border-slate-150 rounded-2xl space-y-4 shadow-sm text-right">
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">اسم المنشأة / المتجر التجاري:</label>
                    <input 
                      type="text"
                      required
                      value={newCompName}
                      onChange={(e) => setNewCompName(e.target.value)}
                      placeholder="مثال: أسواق النخبة للمواد الغذائية"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رقم السجل التجاري (CR Number):</label>
                      <input 
                        type="text"
                        value={newCompCr}
                        onChange={(e) => setNewCompCr(e.target.value)}
                        placeholder="مثال: 1010349283"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">الرقم الضريبي الموحد (VAT):</label>
                      <input 
                        type="text"
                        value={newCompVat}
                        onChange={(e) => setNewCompVat(e.target.value)}
                        placeholder="مثال: 300055443300003"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">باقة الاشتراك المخصصة لهم:</label>
                      <select
                        value={newCompPlan}
                        onChange={(e) => setNewCompPlan(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-700 font-semibold"
                      >
                        <option value="free">باقة التجربة المجانية 🧪 (الحد الأقصى: 5 منتجات)</option>
                        <option value="basic">باقة التموينات الأساسية 📦 (99 ر.س - حد 25 منتجاً)</option>
                        <option value="premium">الباقة الذهبية الممتازة 🏆 (199 ر.س - حد 100 منتج)</option>
                        <option value="enterprise">باقة الشركات اللامحدودة 🚀 (399 ر.س/شهرياً)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">تاريخ نهاية صلاحية الترخيص:</label>
                      <input 
                        type="date"
                        required
                        value={newCompExpiry}
                        onChange={(e) => setNewCompExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-slate-700 font-semibold text-center"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>تأكيد وتسجيل اشتراك المنشأة فوراً 🚀</span>
                </button>
              </form>
            </div>
          )}
          {activeTab === 'users_passwords' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Support request block for Company Admins */}
              {!isQaydAdmin && currentUser.companyId && (
                <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  companies.find(c => c.id === currentUser.companyId)?.supportRequested 
                    ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-md shadow-rose-500/5' 
                    : 'bg-indigo-50/30 border-indigo-100 text-slate-800'
                }`}>
                  <div className="flex gap-3 text-right">
                    <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${companies.find(c => c.id === currentUser.companyId)?.supportRequested ? 'bg-rose-100 text-rose-700 animate-bounce' : 'bg-indigo-50 text-indigo-700'}`}>
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black block">هل تواجه مشكلة تقنية وتحتاج لمساعدة الدعم الفني؟ 🛠️</span>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        عند تمكين طلب الدعم، سيتمكن مشرفو منصة قيود من الدخول الفوري الآمن لمشاهدة وحل مشاكل الكاشير أو فواتيرك وتقديم المساعدة الفورية لك.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!currentUser.companyId) return;
                      const updated = companies.map(c => {
                        if (c.id === currentUser.companyId) {
                          const nextState = !c.supportRequested;
                          addToast(
                            nextState 
                              ? 'تم تمكين طلب الدعم الفني 🛠️! سيتمكن مشرفو قيود الآن من الدخول لمتجرك وحل أي مشكلة تقابلها.' 
                              : 'تم إيقاف تمكين طلب الدعم الفني وتأمين وصول مشرفي قيود.',
                            'info'
                          );
                          return { ...c, supportRequested: nextState };
                        }
                        return c;
                      });
                      onUpdateCompanies(updated);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      companies.find(c => c.id === currentUser.companyId)?.supportRequested 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {companies.find(c => c.id === currentUser.companyId)?.supportRequested ? 'إيقاف تمكين الدعم الفني 🔏' : 'تمكين طلب الدعم الفني 🛠️'}
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-950 flex gap-2.5 text-xs leading-relaxed flex-1 w-full">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">🔒 إدارة أمان كلمات السر والرموز السرية للموظفين</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {isQaydAdmin 
                        ? 'بصفتك المشرف التقني العام للمنصة، يمكنك التحكم بكافة المستخدمين وتعيين الرموز والسرعات لجميع المنشآت والشركات.'
                        : 'بصفتك مدير المنشأة، يمكنك إضافة موظفي الكاشير الجدد، تعديل أرقامهم السرية أو تعليق حساباتهم والتحكم بصلاحياتهم فوراً.'}
                    </p>
                  </div>
                </div>

                {/* Add New User Action button */}
                <button
                  onClick={() => setShowAddUserForm(!showAddUserForm)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/10 shrink-0 w-full sm:w-auto justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showAddUserForm ? 'إلغاء إضافة الموظف' : 'تسجيل موظف جديد 👥'}</span>
                </button>
              </div>

              {/* Add New User Form Dropdown */}
              <AnimatePresence>
                {showAddUserForm && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleAddNewUser}
                    className="bg-white border border-slate-150 p-6 rounded-2xl space-y-4 shadow-sm text-right text-xs"
                  >
                    <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5 justify-end">
                      <span>إضافة موظف جديد إلى الكادر</span>
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                    </h3>

                    {isQaydAdmin && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">الشركة / المنشأة التي ينتمي إليها الموظف:</label>
                        <select
                          value={addUserCompanyId}
                          onChange={(e) => setAddUserCompanyId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        >
                          {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">اسم الموظف الثنائي:</label>
                        <input
                          type="text"
                          required
                          value={addUserName}
                          onChange={(e) => setAddUserName(e.target.value)}
                          placeholder="مثال: صالح الأحمد"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">نوع المسمى الوظيفي والمسؤولية:</label>
                        <select
                          value={addUserRole}
                          onChange={(e) => {
                            const r = e.target.value as 'admin' | 'cashier' | 'manager';
                            setAddUserRole(r);
                            if (r === 'admin' || r === 'manager') {
                              setAddUserPermissions(['sell', 'inventory', 'reports']);
                            } else {
                              setAddUserPermissions(['sell']);
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        >
                          <option value="cashier">كاشير مبيعات (Cashier)</option>
                          <option value="manager">مدير فرع / مستودع (Manager)</option>
                          <option value="admin">مشرف إداري (Admin)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">اسم مستخدم الدخول:</label>
                        <input
                          type="text"
                          required
                          value={addUserUsername}
                          onChange={(e) => setAddUserUsername(e.target.value)}
                          placeholder="مثال: saleh_pos"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">الرمز السري للدخول للكاشير (رقم):</label>
                        <input
                          type="password"
                          required
                          value={addUserPassword}
                          onChange={(e) => setAddUserPassword(e.target.value)}
                          placeholder="أرقام سرية"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-800 block">صلاحيات الموظف في لوحة التحكم ⚙️</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {AVAILABLE_PERMISSIONS.map(p => {
                          const isChecked = addUserPermissions.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleNewUserPermission(p.id)}
                              className={`p-2 border rounded-lg cursor-pointer flex items-center justify-between select-none ${
                                isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-bold' : 'bg-white border-slate-150 text-slate-600'
                              }`}
                            >
                              <span className="text-[10px]">{p.name}</span>
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>حفظ وتسجيل الموظف الجديد</span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Users Grid showing names and secret codes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(isQaydAdmin ? users : users.filter(user => user.companyId === currentUser.companyId)).map(user => {
                  const isVisible = !!visiblePasswords[user.id];
                  const tempPass = editingPasswords[user.id] !== undefined ? editingPasswords[user.id] : '';
                  const userComp = companies.find(c => c.id === user.companyId);

                  return (
                    <div 
                      key={user.id} 
                      className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm relative ${user.status === 'suspended' ? 'border-rose-200 bg-rose-50/5' : 'border-slate-150'}`}
                    >
                      {/* Suspension Tag / Badge */}
                      {user.status === 'suspended' && (
                        <div className="absolute top-4 left-4 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black">
                          الحساب موقوف مؤقتاً 🛑
                        </div>
                      )}

                      {/* Top profile part */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                          user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                          user.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.name.substring(0, 2)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-extrabold text-slate-800">{user.name}</h4>
                            <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                              {user.role === 'admin' ? 'مشرف كاشير عام' : user.role === 'manager' ? 'مدير مخازن' : 'كاشير مبيعات'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">اسم المستخدم للدخول: @{user.username}</p>
                        </div>
                      </div>

                      {/* Display / edit secret password section */}
                      <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">الرمز السري الحالي:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-extrabold text-indigo-600 select-all tracking-wider">
                              {isVisible ? user.password : '••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVisiblePasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors cursor-pointer"
                              title={isVisible ? 'إخفاء الرقم السري' : 'عرض الرقم السري'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Inline password editor */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-150">
                          <label className="text-[10px] font-bold text-slate-500 block">تغيير الرقم السري فورياً:</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={tempPass}
                              onChange={(e) => setEditingPasswords(prev => ({ ...prev, [user.id]: e.target.value }))}
                              placeholder="الرمز الجديد"
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 text-xs rounded-lg focus:outline-none transition-all text-slate-800 font-mono font-bold"
                            />
                            <button
                              onClick={() => handleUpdateUserPassword(user.id, user.name)}
                              disabled={!tempPass}
                              className="px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>حفظ 💾</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Suspension & Delete buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {isQaydAdmin && userComp && (
                          <div className="text-[10px] text-slate-400 font-bold">
                            الشركة: <span className="text-slate-600">{userComp.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mr-auto">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.name, user.status || 'active')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border ${
                              user.status === 'suspended'
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-150'
                            }`}
                          >
                            {user.status === 'suspended' ? 'إلغاء التعليق وتنشيط الحساب' : 'تعليق حساب الموظف مؤقتاً'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                            title="حذف الموظف نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <footer className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-between shrink-0">
          <div className="text-[10px] text-slate-400 font-semibold">
            قيد (QAYD) • بوابة الإشراف والمشتركين الذكية v3.5.0
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            إغلاق اللوحة
          </button>
        </footer>

      </motion.div>
    </div>
  );
}
