import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  History, 
  Settings, 
  Key, 
  Lock, 
  Unlock, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Search, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  Sliders,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Company, SuperAdminUser } from '../types';

interface SuperAdminDashboardProps {
  onClose: () => void;
  onLoginAsCompany: (companyId: string) => void;
  currentCompanyId: string;
}

export default function SuperAdminDashboard({ onClose, onLoginAsCompany, currentCompanyId }: SuperAdminDashboardProps) {
  // Session State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('super_admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'logs' | 'settings'>('overview');

  // Search/Filters
  const [companySearch, setCompanySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Modals / Action States
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<SuperAdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form states for creating company
  const [newCompName, setNewCompName] = useState('');
  const [newCompVat, setNewCompVat] = useState('');
  const [newCompCr, setNewCompCr] = useState('');
  const [newCompBarcode, setNewCompBarcode] = useState('');
  const [newCompVatRate, setNewCompVatRate] = useState(15);
  const [newCompPlan, setNewCompPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('basic');
  const [newCompExpiry, setNewCompExpiry] = useState('');

  // Form states for editing company (Sub extension & Plan change)
  const [editCompPlan, setEditCompPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('basic');
  const [editCompExpiry, setEditCompExpiry] = useState('');
  const [editCompIsActive, setEditCompIsActive] = useState(true);
  const [editCompName, setEditCompName] = useState('');
  const [editCompVat, setEditCompVat] = useState('');
  const [editCompCr, setEditCompCr] = useState('');
  const [editCompBarcode, setEditCompBarcode] = useState('');
  const [editCompVatRate, setEditCompVatRate] = useState(15);
  const [editCompWelcomeMsg, setEditCompWelcomeMsg] = useState('');

  // Load dashboard data if token exists
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Toast auto-hide
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/super-admin/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error('جلسة منتهية الصلاحية، الرجاء إعادة تسجيل الدخول');
        }
        throw new Error('فشل جلب بيانات لوحة التحكم');
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setCompanies(data.companies);
        setUsers(data.users);
        setLogs(data.logs);
        setSettings(data.settings);
      }
    } catch (err: any) {
      setLoadError(err.message || 'حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      if (data.success && data.token) {
        localStorage.setItem('super_admin_token', data.token);
        setToken(data.token);
        showToast('تم تسجيل الدخول بنجاح كمشرف رئيسي 🛡️');
      }
    } catch (err: any) {
      setLoginError(err.message || 'خطأ في اسم المستخدم أو كلمة المرور');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('super_admin_token');
    setToken(null);
    setStats(null);
    setCompanies([]);
    setUsers([]);
    setLogs([]);
    setSettings(null);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) return;

    try {
      const res = await fetch('/api/super-admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCompName,
          vatNumber: newCompVat,
          crNumber: newCompCr,
          vatRate: newCompVatRate,
          barcode: newCompBarcode || undefined,
          subscriptionPlan: newCompPlan,
          subscriptionExpiry: newCompExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });

      if (!res.ok) throw new Error('فشل إنشاء الشركة الجديدة');
      
      const data = await res.json();
      if (data.success) {
        showToast(`تم إنشاء شركة '${newCompName}' والمستخدم المشرف التابع لها بنجاح 🚀`);
        setIsCreateCompanyOpen(false);
        // Reset form
        setNewCompName('');
        setNewCompVat('');
        setNewCompCr('');
        setNewCompBarcode('');
        setNewCompVatRate(15);
        setNewCompPlan('basic');
        setNewCompExpiry('');
        // Refresh
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenEditCompany = (company: Company) => {
    setEditingCompany(company);
    setEditCompName(company.name);
    setEditCompVat(company.vatNumber || '');
    setEditCompCr(company.crNumber || '');
    setEditCompBarcode(company.barcode || '');
    setEditCompVatRate(company.vatRate || 15);
    setEditCompWelcomeMsg(company.welcomeMsg || '');
    setEditCompPlan(company.subscriptionPlan);
    setEditCompExpiry(company.subscriptionExpiry);
    setEditCompIsActive(company.isActive !== false);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      const res = await fetch(`/api/super-admin/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editCompName,
          vatNumber: editCompVat,
          crNumber: editCompCr,
          vatRate: editCompVatRate,
          barcode: editCompBarcode,
          welcomeMsg: editCompWelcomeMsg,
          subscriptionPlan: editCompPlan,
          subscriptionExpiry: editCompExpiry,
          isActive: editCompIsActive
        })
      });

      if (!res.ok) throw new Error('فشل تحديث اشتراك وبيانات الشركة');

      const data = await res.json();
      if (data.success) {
        showToast(`تم تحديث شركة '${editCompName}' بنجاح 💾`);
        setEditingCompany(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    const confirmed = window.confirm(`هل أنت متأكد تماماً من رغبتك في حذف منشأة '${companyName}' وكل مستخدميها بالكامل؟ لا يمكن التراجع عن هذا الإجراء وسيتم قفل وإلغاء حساباتهم نهائياً!`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/super-admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('فشل حذف الشركة من النظام');

      const data = await res.json();
      if (data.success) {
        showToast(`تم حذف شركة '${companyName}' بالكامل من النظام بنجاح 🗑️`);
        if (editingCompany && editingCompany.id === companyId) {
          setEditingCompany(null);
        }
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPassword) return;

    try {
      const res = await fetch('/api/super-admin/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: resetPasswordUser.id,
          newPassword
        })
      });

      if (!res.ok) throw new Error('فشل إعادة تعيين كلمة المرور');

      const data = await res.json();
      if (data.success) {
        showToast(`تمت إعادة تعيين كلمة مرور المستخدم '${resetPasswordUser.name}' بنجاح 🔐`);
        setResetPasswordUser(null);
        setNewPassword('');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMaintenanceMode = async (currentVal: boolean) => {
    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          maintenanceMode: !currentVal
        })
      });

      if (!res.ok) throw new Error('فشل تحديث وضع الصيانة');

      const data = await res.json();
      if (data.success) {
        showToast(`تم ${!currentVal ? 'تفعيل' : 'إلغاء تفعيل'} وضع الصيانة بنجاح ⚙️`);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('فشل حفظ الإعدادات');

      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ إعدادات النظام الرئيسية للـ QAYD بنجاح 💾');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter lists
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    (c.crNumber || '').includes(companySearch) ||
    (c.vatNumber || '').includes(companySearch)
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.companyName.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.user.toLowerCase().includes(logSearch.toLowerCase())
  );

  // Render Login Form if not logged in
  if (!token) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-teal-500/10 text-right relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
            title="إغلاق والعودة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8 relative">
            <div className="inline-flex p-4 bg-teal-500/10 rounded-2xl text-teal-400 border border-teal-500/20 mb-4 animate-bounce">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-black text-white">منظومة قيد (QAYD) الذكية</h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">بوابة الإدارة الشاملة للنظام والمشرفين (Super Admin)</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-bold justify-end">
              <span>{loginError}</span>
              <AlertTriangle className="w-4 h-4 shrink-0" />
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 relative">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">اسم مستخدم المشرف:</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم المكون من أرقام"
                  className="w-full bg-slate-800/80 border border-slate-700/60 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white text-center font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">كلمة المرور السرية:</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/60 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white text-center font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg shadow-teal-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق والمصادقة...</span>
                </>
              ) : (
                <span>دخول آمن بلوحة التحكم 🛡️</span>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center mt-6">
            دخول مشفر بالكامل باستخدام خوارزميات JWT لحماية النظام والشركات.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 font-sans text-right text-slate-200 flex flex-col overflow-hidden" dir="rtl">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[110] bg-teal-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-xl shadow-teal-500/20 border border-teal-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm">{successToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 rounded-2xl text-teal-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">لوحة تحكم المشرف العام (Super Admin)</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">مستقلة تماماً</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">منظومة قيد (QAYD) لإدارة الاشتراكات والمؤسسات</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            title="تحديث البيانات"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-700/50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>

          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black transition-all border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>إغلاق اللوحة</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 border-l border-slate-800 p-4 space-y-2 hidden md:block">
          <div className="px-3 py-2 text-[11px] font-black text-slate-500 uppercase tracking-wider">لوحة القيادة</div>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>إحصائيات وأداء النظام</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'companies' 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5" />
              <span>إدارة الشركات والاشتراكات</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md">{companies.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4.5 h-4.5" />
              <span>مشاهدة جميع المستخدمين</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md">{users.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs' 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4.5 h-4.5" />
              <span>سجل العمليات (Logs)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4.5 h-4.5" />
              <span>إعدادات النظام الرئيسية</span>
            </div>
          </button>

          <div className="pt-6 border-t border-slate-800 mt-6 text-center text-[10px] text-slate-500">
            <div>قيد (QAYD) إصدار v2.4</div>
            <div>جلسة Super Admin مشفرة</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {/* Mobile Navigation Tabs Bar */}
          <div className="flex md:hidden bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1 mb-6 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === 'overview' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              الإحصائيات
            </button>
            <button 
              onClick={() => setActiveTab('companies')}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === 'companies' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              الشركات ({companies.length})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === 'users' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              المستخدمين ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === 'logs' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              السجل
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === 'settings' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              الإعدادات
            </button>
          </div>

          {loadError && (
            <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>{loadError}</span>
              </div>
              <button onClick={fetchDashboardData} className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all font-bold">
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">عدد الشركات الكلي</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mt-3">{stats.totalCompanies}</div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">مؤسسات مسجلة محلياً وعلى السيرفر</p>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">المشتركين الفعالين</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mt-3">{stats.activeSubscribers}</div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">باقات مدفوعة نشطة (أساسي/مميز/شامل)</p>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">مستخدمي الكاشير</span>
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mt-3">{stats.totalUsers}</div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">مشرفين، مديرين، وكاشيرات فاعلين</p>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">الإيراد الشهري التقديري</span>
                    <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-teal-400 mt-3">{stats.monthlyRevenue} <span className="text-xs font-bold text-slate-400">ر.س</span></div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">بناء على تسعير الباقات الفعالة</p>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">الفواتير والمبيعات الإجمالية</span>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mt-3">{stats.totalInvoices}</div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">إجمالي عمليات البيع عبر المنظومة</p>
                </div>
              </div>

              {/* Graphical Dashboard Panel & System Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-teal-400" />
                    <span>تحليل وتوزيع باقات قيد للشركات</span>
                  </h3>
                  <div className="space-y-4">
                    {/* Free Plan */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">الباقة المجانية (Free) - حد 5 منتجات</span>
                        <span className="text-white">{companies.filter(c => c.subscriptionPlan === 'free').length} شركات</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-500 h-full rounded-full" 
                          style={{ width: `${(companies.filter(c => c.subscriptionPlan === 'free').length / companies.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Basic Plan */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-blue-400">الباقة الأساسية (Basic) - 99 ر.س/شهرياً - حد 50 منتج</span>
                        <span className="text-white">{companies.filter(c => c.subscriptionPlan === 'basic').length} شركات</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${(companies.filter(c => c.subscriptionPlan === 'basic').length / companies.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Premium Plan */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-teal-400">الباقة المميزة (Premium) - 299 ر.س/شهرياً - حد 100 منتج</span>
                        <span className="text-white">{companies.filter(c => c.subscriptionPlan === 'premium').length} شركات</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-400 h-full rounded-full" 
                          style={{ width: `${(companies.filter(c => c.subscriptionPlan === 'premium').length / companies.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-indigo-400">باقة الأعمال الكاملة (Enterprise) - 999 ر.س/شهرياً - غير محدودة</span>
                        <span className="text-white">{companies.filter(c => c.subscriptionPlan === 'enterprise').length} شركات</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${(companies.filter(c => c.subscriptionPlan === 'enterprise').length / companies.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-teal-500/5 rounded-xl border border-teal-500/10 text-xs font-medium text-slate-400 leading-relaxed">
                    🌟 <strong className="text-white">توجيه ذكي للنمو:</strong> الباقة الأكثر ربحية للمنظومة هي الباقة <strong className="text-teal-400">المميزة</strong> تليها باقة الأعمال والشركات الكبرى. يوصى بمراجعة مدد تفعيل الاشتراكات المنتهية بانتظام لضمان تحصيل الاشتراكات من لوحة التحكم.
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                      <Sliders className="w-4.5 h-4.5 text-teal-400" />
                      <span>حالة الخوادم وصحة المنظومة</span>
                    </h3>
                    
                    <div className="space-y-4 text-xs font-bold">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-slate-400">قاعدة البيانات الرئيسية (Local/Supabase)</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <span>متصلة وعاملة</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-slate-400">سيرفر التوثيق وحماية الـ JWT</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>آمن ونشط (HS256)</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-slate-400">مزود الذكاء الاصطناعي (Gemini SDK)</span>
                        <span className="text-teal-400">مستعد للطلبات</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-slate-400">وضع الصيانة العام للنظام</span>
                        <span className={settings?.maintenanceMode ? "text-amber-400" : "text-slate-400"}>
                          {settings?.maintenanceMode ? "نشط ⚠️" : "غير نشط (البيع متاح)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => handleToggleMaintenanceMode(settings?.maintenanceMode || false)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        settings?.maintenanceMode 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md' 
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {settings?.maintenanceMode ? (
                        <span>إيقاف وضع الصيانة العام (إتاحة الدخول)</span>
                      ) : (
                        <span>تفعيل وضع الصيانة الفوري (قفل النظام مؤقتاً) ⚠️</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. COMPANIES TAB */}
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="ابحث عن شركة بالاسم، السجل، الرقم الضريبي..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl pr-9 pl-4 py-2.5 text-xs text-white"
                  />
                </div>

                <button
                  onClick={() => setIsCreateCompanyOpen(true)}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-teal-500/15 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء شركة ومؤسسة جديدة</span>
                </button>
              </div>

              {/* Companies Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right text-xs">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="px-6 py-4">اسم الشركة والمؤسسة</th>
                        <th className="px-6 py-4">السجل / الرقم الضريبي</th>
                        <th className="px-6 py-4">الباقة الحالية</th>
                        <th className="px-6 py-4">تاريخ انتهاء الاشتراك</th>
                        <th className="px-6 py-4">حالة الحساب</th>
                        <th className="px-6 py-4 text-center">العمليات والتحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/45">
                      {filteredCompanies.map((comp) => {
                        const isExpired = new Date(comp.subscriptionExpiry) < new Date();
                        return (
                          <tr key={comp.id} className="hover:bg-slate-800/30 transition-all">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-sm">{comp.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-500 font-mono">ID: {comp.id}</span>
                                {comp.barcode && (
                                  <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-mono text-[10px] font-bold flex items-center gap-1">
                                    <span>🏷️ #{comp.barcode}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-mono text-slate-300">س.ت: {comp.crNumber || 'غير متوفر'}</div>
                              <div className="font-mono text-slate-500 text-[10px] mt-0.5">ضريبة: {comp.vatNumber || 'غير متوفر'} ({comp.vatRate}%)</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                comp.subscriptionPlan === 'enterprise' 
                                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                                  : comp.subscriptionPlan === 'premium'
                                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                                  : comp.subscriptionPlan === 'basic'
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {comp.subscriptionPlan === 'enterprise' ? 'مؤسسات (Enterprise)' : 
                                 comp.subscriptionPlan === 'premium' ? 'مميزة (Premium)' :
                                 comp.subscriptionPlan === 'basic' ? 'أساسية (Basic)' : 'مجانية (Free)'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`font-mono font-bold flex items-center gap-1.5 ${isExpired ? 'text-rose-400' : 'text-slate-300'}`}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{comp.subscriptionExpiry}</span>
                              </div>
                              {isExpired && (
                                <span className="text-[9px] font-bold text-rose-500 block mt-0.5">منتهي الصلاحية ⚠️</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                comp.isActive !== false 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${comp.isActive !== false ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                                <span>{comp.isActive !== false ? 'نشط ومفعل' : 'موقوف مؤقتاً'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditCompany(comp)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span>تعديل وإدارة ⚙️</span>
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteCompany(comp.id, comp.name)}
                                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span>حذف 🗑️</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من رغبتك في الدخول والولوج الفوري كمشرف لشركة '${comp.name}'؟ سيتم إغلاق لوحة الأدمن وتحويلك كلياً للكاشير.`)) {
                                      onLoginAsCompany(comp.id);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 border border-teal-500/20 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>دخول كمشرف (Login as)</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredCompanies.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-500 font-bold">
                            لا توجد شركات مطابقة للبحث الحالي.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ابحث عن مستخدم بالاسم، اسم المستخدم، الشركة..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl pr-9 pl-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="text-xs text-slate-400 font-bold">
                  إجمالي المستخدمين في الشركات: <strong className="text-white">{users.length}</strong> مستخدم
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right text-xs">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="px-6 py-4">اسم الموظف</th>
                        <th className="px-6 py-4">اسم المستخدم</th>
                        <th className="px-6 py-4">الشركة التابع لها</th>
                        <th className="px-6 py-4">الصلاحيات</th>
                        <th className="px-6 py-4">آخر ظهور للعملية</th>
                        <th className="px-6 py-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/45">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-all">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm">{user.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">ID: {user.id}</div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-300">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 font-bold text-teal-400">
                            {user.companyName}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                : user.role === 'manager'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {user.role === 'admin' ? 'مدير عام / مالك' : user.role === 'manager' ? 'مدير فرع' : 'كاشير / مبيعات'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => setResetPasswordUser(user)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>إعادة تعيين كلمة المرور 🔐</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-500 font-bold">
                            لا يوجد مستخدمون مطابقون للبحث.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="ابحث في سجل العمليات بالنص أو المنفذ..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl pr-9 pl-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  آخر العمليات والقرارات المسجلة محلياً على السيرفر
                </div>
              </div>

              {/* Logs Timeline Layout */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4.5 bg-slate-800/20 hover:bg-slate-800/40 border border-slate-800/60 rounded-xl transition-all">
                    <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg shrink-0">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-relaxed">{log.action}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                        <span>المنفذ: <strong className="text-slate-400">{log.user}</strong></span>
                        <span>•</span>
                        <span className="font-mono">{new Date(log.timestamp).toLocaleString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-slate-500 font-bold">
                    لا توجد سجلات مطابقة لخيارات البحث.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. SETTINGS TAB */}
          {activeTab === 'settings' && settings && (
            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 pb-3 border-b border-slate-800">
                <Settings className="w-4.5 h-4.5 text-teal-400" />
                <span>إعدادات السيرفر الرئيسي وقيد الأساسية</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-400 block mb-2">بريد الدعم الفني العام لـ QAYD:</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-2">رقم هاتف الدعم / واتساب:</label>
                    <input
                      type="text"
                      value={settings.supportPhone}
                      onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-2">المدة التجريبية التلقائية للشركات الجديدة (أيام):</label>
                    <input
                      type="number"
                      value={settings.defaultTrialDays}
                      onChange={(e) => setSettings({ ...settings, defaultTrialDays: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-2">النسبة التلقائية لضريبة القيمة المضافة للسلع (%):</label>
                    <input
                      type="number"
                      value={settings.defaultVatRate}
                      onChange={(e) => setSettings({ ...settings, defaultVatRate: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-2">تواتر أخذ النسخ الاحتياطية للسيرفر وقاعدة البيانات:</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white cursor-pointer"
                  >
                    <option value="hourly">كل ساعة (Hourly)</option>
                    <option value="daily">يومياً (Daily) - موصى به</option>
                    <option value="weekly">أسبوعياً (Weekly)</option>
                    <option value="monthly">شهرياً (Monthly)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-teal-500/15 cursor-pointer"
                  >
                    حفظ وتثبيت إعدادات النظام الرئيسية
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: CREATE COMPANY */}
      {isCreateCompanyOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Building className="w-5 h-5 text-teal-400" />
                <span>إضافة منشأة محاسبية وتفعيل اشتراك جديد</span>
              </h3>
              <button 
                onClick={() => setIsCreateCompanyOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-slate-300 block mb-1.5">اسم المؤسسة / المتجر التجاري:</label>
                <input 
                  type="text"
                  required
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="مثال: تموينات الياسمين للمواد الغذائية"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1.5">الرقم الضريبي للمنشأة (15 خانة):</label>
                  <input 
                    type="text"
                    maxLength={15}
                    value={newCompVat}
                    onChange={(e) => setNewCompVat(e.target.value)}
                    placeholder="300055443300003"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5">رقم السجل التجاري:</label>
                  <input 
                    type="text"
                    value={newCompCr}
                    onChange={(e) => setNewCompCr(e.target.value)}
                    placeholder="1010000000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const code = `628${Math.floor(1000000000 + Math.random() * 9000000000)}`;
                      setNewCompBarcode(code);
                    }}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer"
                  >
                    توليد باركود تلقائي ⚡
                  </button>
                  <label className="text-slate-300 block">باركود المنشأة / البقالة المالي (Barcode):</label>
                </div>
                <input 
                  type="text"
                  value={newCompBarcode}
                  onChange={(e) => setNewCompBarcode(e.target.value)}
                  placeholder="مثال: 6281010000055 (أو اتركه فارغاً للتوليد التلقائي)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1.5">نسبة الضريبة الافتراضية للفاتورة:</label>
                  <select
                    value={newCompVatRate}
                    onChange={(e) => setNewCompVatRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white cursor-pointer font-mono"
                  >
                    <option value={15}>15% (الضريبة الموحدة بالمملكة)</option>
                    <option value={5}>5%</option>
                    <option value={0}>0% (معفى من الضريبة)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5">نوع باقة نظام قيد (QAYD) الممنوحة:</label>
                  <select
                    value={newCompPlan}
                    onChange={(e) => setNewCompPlan(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white cursor-pointer"
                  >
                    <option value="free">المجانية (Free) - حد 5 منتجات</option>
                    <option value="basic">الأساسية (Basic) - حد 50 منتج</option>
                    <option value="premium">المميزة (Premium) - حد 100 منتج</option>
                    <option value="enterprise">باقة الأعمال (Enterprise) - غير محدودة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5">تاريخ انتهاء الترخيص والاشتراك:</label>
                <input 
                  type="date"
                  value={newCompExpiry}
                  onChange={(e) => setNewCompExpiry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">إذا ترك فارغاً سيتم منح 30 يوماً تلقائياً من تاريخ اليوم.</span>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateCompanyOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  حفظ وتأسيس المنشأة المحاسبية 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SUBSCRIPTION */}
      {editingCompany && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-teal-400" />
                <span>تعديل بيانات واشتراك: {editingCompany.name}</span>
              </h3>
              <button 
                onClick={() => setEditingCompany(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs font-bold max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-slate-300 block mb-1.5">اسم المؤسسة / المتجر التجاري:</label>
                <input 
                  type="text"
                  required
                  value={editCompName}
                  onChange={(e) => setEditCompName(e.target.value)}
                  placeholder="مثال: تموينات الياسمين للمواد الغذائية"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1.5">الرقم الضريبي للمنشأة (15 خانة):</label>
                  <input 
                    type="text"
                    maxLength={15}
                    value={editCompVat}
                    onChange={(e) => setEditCompVat(e.target.value)}
                    placeholder="300055443300003"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5">رقم السجل التجاري:</label>
                  <input 
                    type="text"
                    value={editCompCr}
                    onChange={(e) => setEditCompCr(e.target.value)}
                    placeholder="1010000000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const code = `628${Math.floor(1000000000 + Math.random() * 9000000000)}`;
                      setEditCompBarcode(code);
                    }}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer"
                  >
                    توليد باركود جديد ⚡
                  </button>
                  <label className="text-slate-300 block">باركود المنشأة / البقالة (Company Barcode):</label>
                </div>
                <input 
                  type="text"
                  value={editCompBarcode}
                  onChange={(e) => setEditCompBarcode(e.target.value)}
                  placeholder="مثال: 6281010000055"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1.5">نسبة الضريبة الافتراضية للفاتورة:</label>
                  <select
                    value={editCompVatRate}
                    onChange={(e) => setEditCompVatRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white cursor-pointer font-mono text-xs"
                  >
                    <option value={15}>15% (الضريبة الموحدة بالمملكة)</option>
                    <option value={5}>5%</option>
                    <option value={0}>0% (معفى من الضريبة)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5">تغيير باقة ترخيص نظام قيد:</label>
                  <select
                    value={editCompPlan}
                    onChange={(e) => setEditCompPlan(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white cursor-pointer text-xs"
                  >
                    <option value="free">المجانية (Free) - حد 5 منتجات</option>
                    <option value="basic">الأساسية (Basic) - حد 50 منتج</option>
                    <option value="premium">المميزة (Premium) - حد 100 منتج</option>
                    <option value="enterprise">باقة الأعمال (Enterprise) - غير محدودة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5">تاريخ انتهاء صلاحية الاشتراك (تمديد):</label>
                <input 
                  type="date"
                  required
                  value={editCompExpiry}
                  onChange={(e) => setEditCompExpiry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono cursor-pointer text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5">رسالة الترحيب بالفاتورة (أسفل الفاتورة):</label>
                <input 
                  type="text"
                  value={editCompWelcomeMsg}
                  onChange={(e) => setEditCompWelcomeMsg(e.target.value)}
                  placeholder="مثال: نشكركم لتسوقكم معنا!"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5">تفعيل أو إيقاف حساب الشركة كلياً:</label>
                <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-emerald-400">
                    <input 
                      type="radio" 
                      name="isActive" 
                      checked={editCompIsActive === true}
                      onChange={() => setEditCompIsActive(true)}
                      className="accent-teal-500 scale-125"
                    />
                    <span>نشط ومفعل (الحساب مفتوح للبيع)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-rose-400">
                    <input 
                      type="radio" 
                      name="isActive" 
                      checked={editCompIsActive === false}
                      onChange={() => setEditCompIsActive(false)}
                      className="accent-rose-500 scale-125"
                    />
                    <span>موقوف / معلق (يتم قفل الشاشة للعميل) ⚠️</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 mt-5">
                <button
                  type="button"
                  onClick={() => handleDeleteCompany(editingCompany.id, editingCompany.name)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs border border-rose-500/20"
                >
                  <span>حذف المنشأة نهائياً 🗑️</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCompany(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl transition-all cursor-pointer text-xs shadow-lg shadow-teal-500/15"
                  >
                    حفظ وتثبيت البيانات 💾
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Key className="w-5 h-5 text-teal-400" />
                <span>إعادة تعيين كلمة المرور</span>
              </h3>
              <button 
                onClick={() => setResetPasswordUser(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
              سيتم تغيير كلمة المرور للموظف <strong className="text-white">{resetPasswordUser.name}</strong> التابع لمنشأة <strong className="text-teal-400">{resetPasswordUser.companyName}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-slate-300 block mb-1.5">كلمة المرور الجديدة:</label>
                <input 
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة الآمنة"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-center font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordUser(null);
                    setNewPassword('');
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  تغيير كلمة المرور فوراً 🔐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
