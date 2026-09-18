/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, Users, ShieldAlert, MapPin, Cpu, Package, 
  FolderTree, Truck, User, Boxes, FileSpreadsheet, Receipt, 
  Undo2, DollarSign, Vault, Calculator, ScrollText, Sliders, 
  BarChart3, Plus, Search, Trash2, Check, X, ArrowLeft, ArrowRight,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Download,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Product, Company, Order, HardwareDevice, PaymentMethod } from '../types';
import QaydLogo from './QaydLogo';

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

interface QaydDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  currentCompanyId: string;
  setCurrentCompanyId: (id: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  devices: HardwareDevice[];
  storeName: string;
  setStoreName: (val: string) => void;
  storeVat: string;
  setStoreVat: (val: string) => void;
  storeCr: string;
  setStoreCr: (val: string) => void;
  storeVatRate: number;
  setStoreVatRate: (val: number) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

// Sub-interfaces for local dynamic states
interface ERPUser {
  id: string;
  name: string;
  username: string;
  role: string;
  branch: string;
  status: 'active' | 'inactive';
}

interface ERPRole {
  id: string;
  name: string;
  arabicName: string;
  permissions: string[];
}

interface ERPBranch {
  id: string;
  name: string;
  city: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface ERPSupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  category: string;
  balance: number;
}

interface ERPCustomer {
  id: string;
  name: string;
  phone: string;
  points: number;
  balance: number;
}

interface ERPExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
}

interface ERPSafe {
  id: string;
  name: string;
  balance: number;
  type: 'cash_drawer' | 'safe';
  transactions: { id: string; amount: number; type: 'deposit' | 'withdraw'; note: string; timestamp: number }[];
}

interface ERPJournalEntry {
  id: string;
  invoiceNumber?: string;
  date: string;
  description: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
}

interface ERPActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: number;
}

export default function QaydDashboard({
  isOpen,
  onClose,
  companies,
  setCompanies,
  currentCompanyId,
  setCurrentCompanyId,
  products,
  setProducts,
  orders,
  setOrders,
  devices,
  storeName,
  setStoreName,
  storeVat,
  setStoreVat,
  storeCr,
  setStoreCr,
  storeVatRate,
  setStoreVatRate,
  addToast
}: QaydDashboardProps) {
  
  const isSuperAdmin = typeof window !== 'undefined' && !!localStorage.getItem('super_admin_token');
  const visibleCompanies = isSuperAdmin ? companies : companies.filter(c => c.id === currentCompanyId);

  // Active Module Tab
  const [activeTab, setActiveTab] = useState<string>('companies');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Users State
  const [erpUsers, setErpUsers] = useState<ERPUser[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_users');
      return saved ? JSON.parse(saved) : [
        { id: 'usr-1', name: 'أحمد القحطاني', username: 'ahmed_manager', role: 'admin', branch: 'الفرع الرئيسي - الرياض', status: 'active' },
        { id: 'usr-2', name: 'سارة الدوسري', username: 'sara_cashier', role: 'cashier', branch: 'الفرع الرئيسي - الرياض', status: 'active' },
        { id: 'usr-3', name: 'خالد اليوسف', username: 'khaled_accountant', role: 'accountant', branch: 'فرع جدة - شارع فلسطين', status: 'active' }
      ];
    } catch (e) {
      return [];
    }
  });

  // 2. Roles/Permissions State
  const [erpRoles, setErpRoles] = useState<ERPRole[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_roles');
      return saved ? JSON.parse(saved) : [
        { id: 'role-admin', name: 'Administrator', arabicName: 'مدير النظام الكامل', permissions: ['sales', 'inventory', 'reports', 'settings', 'users'] },
        { id: 'role-cashier', name: 'Cashier', arabicName: 'كاشير نقطة بيع', permissions: ['sales'] },
        { id: 'role-accountant', name: 'Accountant', arabicName: 'المحاسب المالي', permissions: ['reports', 'accounting', 'expenses'] },
        { id: 'role-stock', name: 'Stock Keeper', arabicName: 'أمين المستودع والمخازن', permissions: ['inventory'] }
      ];
    } catch (e) {
      return [];
    }
  });

  // 3. Branches State
  const [erpBranches, setErpBranches] = useState<ERPBranch[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_branches');
      return saved ? JSON.parse(saved) : [
        { id: 'br-1', name: 'الفرع الرئيسي - الرياض', city: 'الرياض', phone: '0112223344', status: 'active' },
        { id: 'br-2', name: 'فرع جدة - شارع فلسطين', city: 'جدة', phone: '0125556677', status: 'active' },
        { id: 'br-3', name: 'فرع الدمام - الكورنيش', city: 'الدمام', phone: '0138889900', status: 'inactive' }
      ];
    } catch (e) {
      return [];
    }
  });

  // 4. Suppliers State
  const [erpSuppliers, setErpSuppliers] = useState<ERPSupplier[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_suppliers');
      return saved ? JSON.parse(saved) : [
        { id: 'sup-1', name: 'شركة المراعي للألبان', contactPerson: 'عبد الله السديري', phone: '0501112222', category: 'الألبان والمبردات', balance: 4500 },
        { id: 'sup-2', name: 'الشركة الوطنية للتوزيع (حلواني)', contactPerson: 'سعيد العلي', phone: '0502223333', category: 'المواد الغذائية والحلويات', balance: 1200 },
        { id: 'sup-3', name: 'مؤسسة الرياض التجارية للمعلبات', contactPerson: 'سلمان الحربي', phone: '0504445555', category: 'المعلبات والجاف', balance: 0 }
      ];
    } catch (e) {
      return [];
    }
  });

  // 5. Customers State
  const [erpCustomers, setErpCustomers] = useState<ERPCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_customers');
      return saved ? JSON.parse(saved) : [
        { id: 'cust-1', name: 'محمد العتيبي', phone: '0556677889', points: 340, balance: 120 },
        { id: 'cust-2', name: 'فهد الدوسري', phone: '0544332211', points: 150, balance: 0 },
        { id: 'cust-3', name: 'منى الشهراني', phone: '0566773344', points: 820, balance: -50 } // Credit
      ];
    } catch (e) {
      return [];
    }
  });

  // 6. Expenses State
  const [erpExpenses, setErpExpenses] = useState<ERPExpense[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_expenses');
      return saved ? JSON.parse(saved) : [
        { id: 'exp-1', title: 'إيجار الفرع الشهري', category: 'إيجارات', amount: 8000, date: '2026-07-01' },
        { id: 'exp-2', title: 'فاتورة الكهرباء والماء', category: 'مرافق عامة', amount: 1450, date: '2026-07-05' },
        { id: 'exp-3', title: 'رواتب موظفين الوردية الصباحية', category: 'رواتب وأجور', amount: 12000, date: '2026-07-02' },
        { id: 'exp-4', title: 'شراء ورق طابعات وصيانة كاشير', category: 'صيانة ومكتبية', amount: 350, date: '2026-07-08' }
      ];
    } catch (e) {
      return [];
    }
  });

  // 7. Safes/Cash Drawers State
  const [erpSafes, setErpSafes] = useState<ERPSafe[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_safes');
      return saved ? JSON.parse(saved) : [
        { id: 'safe-1', name: 'الخزينة المركزية للمتجر (Safe)', balance: 85000, type: 'safe', transactions: [] },
        { id: 'safe-2', name: 'درج كاشير نقطة البيع 1', balance: 3450, type: 'cash_drawer', transactions: [] },
        { id: 'safe-3', name: 'درج كاشير نقطة البيع 2', balance: 1200, type: 'cash_drawer', transactions: [] }
      ];
    } catch (e) {
      return [];
    }
  });

  // 8. Accounting Entries / Journal Entries (القيود المحاسبية)
  // Let's generate entries dynamically from historical orders + expenses
  const [erpJournalEntries, setErpJournalEntries] = useState<ERPJournalEntry[]>([]);

  // 9. Activity Logs
  const [erpActivityLogs, setErpActivityLogs] = useState<ERPActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('pos_erp_activity_logs');
      return saved ? JSON.parse(saved) : [
        { id: 'log-1', user: 'أحمد القحطاني', action: 'فتح جلسة بيع جديدة للمؤسسة والبدء بالعمل', timestamp: Date.now() - 3600000 * 4 },
        { id: 'log-2', user: 'سارة الدوسري', action: 'تغيير إعدادات طابعة الإيصالات الذكية', timestamp: Date.now() - 3600000 * 2 },
        { id: 'log-3', user: 'نظام قيد الآلي', action: 'توليد قيود تسوية المحاسبة الضريبية للربع الحالي', timestamp: Date.now() - 1800000 }
      ];
    } catch (e) {
      return [];
    }
  });

  // Sync state loaded from current company id
  useEffect(() => {
    if (!currentCompanyId) return;

    // Helper to get with fallback
    const getSaved = (key: string, fallback: any) => {
      try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
      } catch (e) {
        return fallback;
      }
    };

    setErpUsers(getSaved(`pos_erp_users_${currentCompanyId}`, [
      { id: 'usr-1', name: 'أحمد القحطاني', username: 'ahmed_manager', role: 'admin', branch: 'الفرع الرئيسي - الرياض', status: 'active' },
      { id: 'usr-2', name: 'سارة الدوسري', username: 'sara_cashier', role: 'cashier', branch: 'الفرع الرئيسي - الرياض', status: 'active' },
      { id: 'usr-3', name: 'خالد اليوسف', username: 'khaled_accountant', role: 'accountant', branch: 'فرع جدة - شارع فلسطين', status: 'active' }
    ]));

    setErpRoles(getSaved(`pos_erp_roles_${currentCompanyId}`, [
      { id: 'role-admin', name: 'Administrator', arabicName: 'مدير النظام الكامل', permissions: ['sales', 'inventory', 'reports', 'settings', 'users'] },
      { id: 'role-cashier', name: 'Cashier', arabicName: 'كاشير نقطة بيع', permissions: ['sales'] },
      { id: 'role-accountant', name: 'Accountant', arabicName: 'المحاسب المالي', permissions: ['reports', 'accounting', 'expenses'] },
      { id: 'role-stock', name: 'Stock Keeper', arabicName: 'أمين المستودع والمخازن', permissions: ['inventory'] }
    ]));

    setErpBranches(getSaved(`pos_erp_branches_${currentCompanyId}`, [
      { id: 'br-1', name: 'الفرع الرئيسي - الرياض', city: 'الرياض', phone: '0112223344', status: 'active' },
      { id: 'br-2', name: 'فرع جدة - شارع فلسطين', city: 'جدة', phone: '0125556677', status: 'active' },
      { id: 'br-3', name: 'فرع الدمام - الكورنيش', city: 'الدمام', phone: '0138889900', status: 'inactive' }
    ]));

    setErpSuppliers(getSaved(`pos_erp_suppliers_${currentCompanyId}`, [
      { id: 'sup-1', name: 'شركة المراعي للألبان', contactPerson: 'عبد الله السديري', phone: '0501112222', category: 'الألبان والمبردات', balance: 4500 },
      { id: 'sup-2', name: 'الشركة الوطنية للتوزيع (حلواني)', contactPerson: 'سعيد العلي', phone: '0502223333', category: 'المواد الغذائية والحلويات', balance: 1200 },
      { id: 'sup-3', name: 'مؤسسة الرياض التجارية للمعلبات', contactPerson: 'سلمان الحربي', phone: '0504445555', category: 'المعلبات والجاف', balance: 0 }
    ]));

    setErpCustomers(getSaved(`pos_erp_customers_${currentCompanyId}`, [
      { id: 'cust-1', name: 'محمد العتيبي', phone: '0556677889', points: 340, balance: 120 },
      { id: 'cust-2', name: 'فهد الدوسري', phone: '0544332211', points: 150, balance: 0 },
      { id: 'cust-3', name: 'منى الشهراني', phone: '0566773344', points: 820, balance: -50 }
    ]));

    setErpExpenses(getSaved(`pos_erp_expenses_${currentCompanyId}`, [
      { id: 'exp-1', title: 'إيجار الفرع الشهري', category: 'إيجارات', amount: 8000, date: '2026-07-01' },
      { id: 'exp-2', title: 'فاتورة الكهرباء والماء', category: 'مرافق عامة', amount: 1450, date: '2026-07-05' },
      { id: 'exp-3', title: 'رواتب موظفين الوردية الصباحية', category: 'رواتب وأجور', amount: 12000, date: '2026-07-02' },
      { id: 'exp-4', title: 'شراء ورق طابعات وصيانة كاشير', category: 'صيانة ومكتبية', amount: 350, date: '2026-07-08' }
    ]));

    setErpSafes(getSaved(`pos_erp_safes_${currentCompanyId}`, [
      { id: 'safe-1', name: 'الخزينة المركزية للمتجر (Safe)', balance: 85000, type: 'safe', transactions: [] },
      { id: 'safe-2', name: 'درج كاشير نقطة البيع 1', balance: 3450, type: 'cash_drawer', transactions: [] },
      { id: 'safe-3', name: 'درج كاشير نقطة البيع 2', balance: 1200, type: 'cash_drawer', transactions: [] }
    ]));

    setErpActivityLogs(getSaved(`pos_erp_activity_logs_${currentCompanyId}`, [
      { id: 'log-1', user: 'أحمد القحطاني', action: 'فتح جلسة بيع جديدة للمؤسسة والبدء بالعمل', timestamp: Date.now() - 3600000 * 4 },
      { id: 'log-2', user: 'سارة الدوسري', action: 'تغيير إعدادات طابعة الإيصالات الذكية', timestamp: Date.now() - 3600000 * 2 },
      { id: 'log-3', user: 'نظام قيد الآلي', action: 'توليد قيود تسوية المحاسبة الضريبية للربع الحالي', timestamp: Date.now() - 1800000 }
    ]));
  }, [currentCompanyId]);

  // Keep state synced with LocalStorage under the active company ID suffix
  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_users_${currentCompanyId}`, JSON.stringify(erpUsers));
    }
  }, [erpUsers, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_roles_${currentCompanyId}`, JSON.stringify(erpRoles));
    }
  }, [erpRoles, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_branches_${currentCompanyId}`, JSON.stringify(erpBranches));
    }
  }, [erpBranches, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_suppliers_${currentCompanyId}`, JSON.stringify(erpSuppliers));
    }
  }, [erpSuppliers, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_customers_${currentCompanyId}`, JSON.stringify(erpCustomers));
    }
  }, [erpCustomers, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_expenses_${currentCompanyId}`, JSON.stringify(erpExpenses));
    }
  }, [erpExpenses, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_safes_${currentCompanyId}`, JSON.stringify(erpSafes));
    }
  }, [erpSafes, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_erp_activity_logs_${currentCompanyId}`, JSON.stringify(erpActivityLogs));
    }
  }, [erpActivityLogs, currentCompanyId]);

  // Generate Accounting entries dynamically whenever orders or expenses change
  useEffect(() => {
    const entries: ERPJournalEntry[] = [];
    
    // Add sales invoice entries
    orders.forEach((order, idx) => {
      entries.push({
        id: `je-sale-${order.id}`,
        invoiceNumber: order.invoiceNumber,
        date: new Date(order.timestamp).toISOString().split('T')[0],
        description: `قيد مبيعات يومية - فاتورة رقم ${order.invoiceNumber}`,
        debitAccount: order.paymentMethod === 'cash' ? 'حـ/ الصندوق (درج الكاشير)' : 'حـ/ البنك (شبكة مدى/فيزا)',
        debitAmount: order.total,
        creditAccount: 'حـ/ إيرادات المبيعات والخدمات',
        creditAmount: order.subtotal
      });
      // VAT part of entry
      if (order.vat > 0) {
        entries.push({
          id: `je-sale-vat-${order.id}`,
          invoiceNumber: order.invoiceNumber,
          date: new Date(order.timestamp).toISOString().split('T')[0],
          description: `قيد ضريبة القيمة المضافة المحتسبة - فاتورة رقم ${order.invoiceNumber}`,
          debitAccount: order.paymentMethod === 'cash' ? 'حـ/ الصندوق (درج الكاشير)' : 'حـ/ البنك (شبكة مدى/فيزا)',
          debitAmount: order.vat,
          creditAccount: 'حـ/ حساب ضريبة القيمة المضافة المستحقة للدولة',
          creditAmount: order.vat
        });
      }
    });

    // Add expense entries
    erpExpenses.forEach((exp) => {
      entries.push({
        id: `je-exp-${exp.id}`,
        date: exp.date,
        description: `قيد مصروفات عمومية وتشغيلية - ${exp.title}`,
        debitAccount: `حـ/ مصروفات تشغيلية - تصنيف (${exp.category})`,
        debitAmount: exp.amount,
        creditAccount: 'حـ/ الخزينة الرئيسية للمتجر',
        creditAmount: exp.amount
      });
    });

    setErpJournalEntries(entries);
  }, [orders, erpExpenses]);

  if (!isOpen) return null;

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('cashier');
  const [newUserBranch, setNewUserBranch] = useState('الفرع الرئيسي - الرياض');
  
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('الرياض');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierCat, setNewSupplierCat] = useState('المواد الغذائية والحلويات');
  const [newSupplierBalance, setNewSupplierBalance] = useState<number>(0);

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerBalance, setNewCustomerBalance] = useState<number>(0);

  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('مصاريف عامة');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>('');

  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [depositSafeId, setDepositSafeId] = useState('safe-1');
  const [depositNote, setDepositNote] = useState('');

  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<Order | null>(null);

  // Helper log functions
  const addLog = (user: string, action: string) => {
    setErpActivityLogs(prev => [
      { id: `log-${Date.now()}`, user, action, timestamp: Date.now() },
      ...prev
    ]);
  };

  // ADD Handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const newUser: ERPUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      username: `user_${Math.random().toString(36).substring(2, 7)}`,
      role: newUserRole,
      branch: newUserBranch,
      status: 'active'
    };
    setErpUsers(prev => [...prev, newUser]);
    addLog('أحمد القحطاني', `أضاف مستخدماً جديداً للمنظومة: ${newUserName} بصلاحية ${newUserRole}`);
    addToast(`تم إضافة المستخدم ${newUserName} بنجاح.`, 'success');
    setNewUserName('');
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const newBr: ERPBranch = {
      id: `br-${Date.now()}`,
      name: newBranchName,
      city: newBranchCity,
      phone: newBranchPhone || 'N/A',
      status: 'active'
    };
    setErpBranches(prev => [...prev, newBr]);
    addLog('أحمد القحطاني', `أضاف فرعاً جديداً للشركة: ${newBranchName}`);
    addToast(`تم فتح الفرع ${newBranchName} بنجاح.`, 'success');
    setNewBranchName('');
    setNewBranchPhone('');
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    const newSup: ERPSupplier = {
      id: `sup-${Date.now()}`,
      name: newSupplierName,
      contactPerson: newSupplierContact,
      phone: newSupplierPhone,
      category: newSupplierCat,
      balance: Number(newSupplierBalance) || 0
    };
    setErpSuppliers(prev => [...prev, newSup]);
    addLog('أحمد القحطاني', `سجل مورداً جديداً بالمنظومة: ${newSupplierName}`);
    addToast(`تم إضافة المورد ${newSupplierName} بنجاح.`, 'success');
    setNewSupplierName('');
    setNewSupplierContact('');
    setNewSupplierPhone('');
    setNewSupplierBalance(0);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;
    const newCust: ERPCustomer = {
      id: `cust-${Date.now()}`,
      name: newCustomerName,
      phone: newCustomerPhone,
      points: 10, // free starter points
      balance: Number(newCustomerBalance) || 0
    };
    setErpCustomers(prev => [...prev, newCust]);
    addLog('أحمد القحطاني', `سجل عميلاً جديداً في قاعدة البيانات: ${newCustomerName}`);
    addToast(`تم تسجيل العميل ${newCustomerName} في نظام الولاء.`, 'success');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerBalance(0);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount) return;
    const amountVal = Number(newExpenseAmount);
    const newExp: ERPExpense = {
      id: `exp-${Date.now()}`,
      title: newExpenseTitle,
      category: newExpenseCategory,
      amount: amountVal,
      date: new Date().toISOString().split('T')[0]
    };
    setErpExpenses(prev => [newExp, ...prev]);

    // Debit the central Safe (if safe balance exists)
    setErpSafes(prev => prev.map(safe => {
      if (safe.id === 'safe-1') {
        return {
          ...safe,
          balance: Math.max(0, safe.balance - amountVal)
        };
      }
      return safe;
    }));

    addLog('خالد اليوسف', `أثبت مصروفاً عمومياً جديداً: ${newExpenseTitle} بمبلغ ${amountVal} ر.س`);
    addToast(`تم تسجيل المصروف بقيمة ${amountVal} ر.س وخصمه من الخزينة.`, 'success');
    setNewExpenseTitle('');
    setNewExpenseAmount('');
  };

  const handleSafeAction = (e: React.FormEvent, isDeposit: boolean) => {
    e.preventDefault();
    if (!depositAmount) return;
    const amt = Number(depositAmount);
    setErpSafes(prev => prev.map(safe => {
      if (safe.id === depositSafeId) {
        const newBal = isDeposit ? safe.balance + amt : Math.max(0, safe.balance - amt);
        return {
          ...safe,
          balance: newBal,
          transactions: [
            {
              id: `tr-${Date.now()}`,
              amount: amt,
              type: isDeposit ? 'deposit' : 'withdraw',
              note: depositNote || (isDeposit ? 'إيداع نقدي يدوي' : 'سحب نقدي يدوي'),
              timestamp: Date.now()
            },
            ...safe.transactions
          ]
        };
      }
      return safe;
    }));
    addLog('أحمد القحطاني', `أمر ${isDeposit ? 'إيداع' : 'سحب'} مالي بقيمة ${amt} ر.س على الخزينة/الدرج`);
    addToast(`تمت عملية التسوية بنجاح.`, 'success');
    setDepositAmount('');
    setDepositNote('');
  };

  // Switch Active Company with Toast
  const handleCompanySwitch = (id: string) => {
    setCurrentCompanyId(id);
    const selected = companies.find(c => c.id === id);
    if (selected) {
      setStoreName(selected.name);
      setStoreVat(selected.vatNumber);
      setStoreCr(selected.crNumber);
      setStoreVatRate(selected.vatRate);
      addToast(`تم التغيير إلى ${selected.name} بنجاح.`, 'success');
      addLog('نظام قيد', `تم تغيير المؤسسة النشطة إلى: ${selected.name}`);
    }
  };

  // Subscription Upgrading Simulator
  const handleUpgradeSubscription = (plan: 'free' | 'basic' | 'premium' | 'enterprise') => {
    setCompanies(prev => prev.map(c => {
      if (c.id === currentCompanyId) {
        let maxLim = 100;
        if (plan === 'free') maxLim = 5;
        if (plan === 'basic') maxLim = 25;
        if (plan === 'premium') maxLim = 100;
        if (plan === 'enterprise') maxLim = 999999;

        return {
          ...c,
          subscriptionPlan: plan,
          subscriptionExpiry: '2027-07-09',
          maxProductsLimit: maxLim
        };
      }
      return c;
    }));
    addToast(`رائع! تم تحديث اشتراك المؤسسة إلى الباقة الجديدة بنجاح. 🎉`, 'success');
    addLog('أحمد القحطاني', `تم ترقية اشتراك الشركة النشطة إلى باقة (${plan})`);
  };

  // Stock Adjustment Handler
  const handleStockAdjust = (prodId: string, diff: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === prodId) {
        const newStock = Math.max(0, p.stock + diff);
        return { ...p, stock: newStock };
      }
      return p;
    }));
    const pMatched = products.find(p => p.id === prodId);
    if (pMatched) {
      addLog('أمين المستودع والمخازن', `تعديل مخزني لمنتج ${pMatched.name}: مقدار التعديل (${diff > 0 ? '+' : ''}${diff})، الرصيد الجديد: ${Math.max(0, pMatched.stock + diff)}`);
      addToast(`تم تعديل مخزون المنتج ${pMatched.name} بنجاح.`, 'info');
    }
  };

  // Refund Order / Return item handler inside Invoices
  const handleRefundOrderInvoice = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Refund items back to inventory
    setProducts(prev => prev.map(p => {
      const orderItem = targetOrder.items.find(item => item.product.id === p.id);
      if (orderItem) {
        return {
          ...p,
          stock: p.stock + orderItem.quantity
        };
      }
      return p;
    }));

    // Remove or flag order as refunded
    setOrders(prev => prev.filter(o => o.id !== orderId));

    addLog('سارة الدوسري', `تم إرجاع الفاتورة رقم ${targetOrder.invoiceNumber} بنجاح وإرجاع البضاعة للمخزن`);
    addToast(`تم استرجاع الفاتورة رقم ${targetOrder.invoiceNumber} بالكامل وإعادة المنتجات للمخزون.`, 'success');
    setSelectedInvoiceDetail(null);
  };

  // Sidebar structure representing user's 20 modules
  const navigationItems = [
    { id: 'companies', label: 'الشركات 🏢', category: 'المؤسسة والاشتراكات', icon: Building2 },
    { id: 'subscriptions', label: 'الاشتراكات 🎫', category: 'المؤسسة والاشتراكات', icon: CreditCard },
    { id: 'users', label: 'المستخدمين 👥', category: 'الصلاحيات والفروع', icon: Users },
    { id: 'roles', label: 'الصلاحيات 🔑', category: 'الصلاحيات والفروع', icon: ShieldAlert },
    { id: 'branches', label: 'الفروع 📍', category: 'الصلاحيات والفروع', icon: MapPin },
    { id: 'devices', label: 'أجهزة الكاشير 🖥️', category: 'الأجهزة ونقاط البيع', icon: Cpu },
    { id: 'products', label: 'المنتجات 🍎', category: 'إدارة المنتجات والمخزن', icon: Package },
    { id: 'categories', label: 'التصنيفات 📂', category: 'إدارة المنتجات والمخزن', icon: FolderTree },
    { id: 'suppliers', label: 'الموردين 🚛', category: 'المشتريات والعملاء', icon: Truck },
    { id: 'customers', label: 'العملاء 👤', category: 'المشتريات والعملاء', icon: User },
    { id: 'inventory', label: 'المخزون 📦', category: 'إدارة المنتجات والمخزن', icon: Boxes },
    { id: 'invoices', label: 'الفواتير 📄', category: 'العمليات والمالية', icon: FileSpreadsheet },
    { id: 'returns', label: 'المرتجعات 🔄', category: 'العمليات والمالية', icon: Undo2 },
    { id: 'expenses', label: 'المصروفات 💸', category: 'العمليات والمالية', icon: DollarSign },
    { id: 'safes', label: 'الخزن 🏦', category: 'العمليات والمالية', icon: Vault },
    { id: 'accounting', label: 'القيود المحاسبية 🧮', category: 'العمليات والمالية', icon: Calculator },
    { id: 'audit_logs', label: 'سجل العمليات 📜', category: 'العمليات والمالية', icon: ScrollText },
    { id: 'settings', label: 'الإعدادات ⚙️', category: 'أخرى', icon: Sliders },
    { id: 'reports', label: 'التقارير 📊', category: 'أخرى', icon: BarChart3 }
  ];

  // Grouped Navigation for modern look
  const categoriesList = ['المؤسسة والاشتراكات', 'الصلاحيات والفروع', 'الأجهزة ونقاط البيع', 'إدارة المنتجات والمخزن', 'المشتريات والعملاء', 'العمليات والمالية', 'أخرى'];

  // Metrics summary for top bar
  const totalInvoicesValue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalExpensesValue = erpExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSafeMoney = erpSafes.reduce((sum, s) => sum + s.balance, 0);
  const totalProductsCount = products.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden" id="qayd-system-dashboard">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full h-[90vh] max-w-[95vw] flex flex-col overflow-hidden text-right"
          style={{ direction: 'rtl' }}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-teal-600/20 p-1.5 rounded-xl border border-teal-500/20">
                <QaydLogo size={42} showText={false} animated={true} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>منظومة قيد (QAYD) لإدارة المنشآت المحاسبية</span>
                  <span className="text-[10px] bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">ERP Pro</span>
                </h1>
                <p className="text-xs text-slate-300">نظام موحد ومترابط لإدارة الشركات والقيود المحاسبية، المخازن، الحسابات الختامية، وعمليات الكاشير الذكية</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 bg-slate-800/60 hover:bg-rose-600 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">إجمالي مبيعات الفواتير</span>
                <span className="font-mono text-base font-black text-emerald-600 mt-1 block">
                  {totalInvoicesValue.toFixed(2)} ر.س
                </span>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">المصروفات التشغيلية المثبتة</span>
                <span className="font-mono text-base font-black text-rose-600 mt-1 block">
                  {totalExpensesValue.toFixed(2)} ر.س
                </span>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">رصيد الخزن المالي الموحد</span>
                <span className="font-mono text-base font-black text-indigo-600 mt-1 block">
                  {totalSafeMoney.toFixed(2)} ر.س
                </span>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Vault className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">المنتجات النشطة بالمخزن</span>
                <span className="font-mono text-base font-black text-slate-800 mt-1 block">
                  {totalProductsCount} سلع
                </span>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Master Panel Workspace */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            
            {/* RIGHT SIDE: Navigation Sidebar (20 Modules Hierarchy) */}
            <aside className="w-full lg:w-72 bg-slate-50 border-l border-slate-200 flex flex-col overflow-y-auto shrink-0">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="ابحث عن وحدة أو قيد محاسبي..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-right font-medium"
                  />
                </div>
              </div>

              {/* Modules Group lists */}
              <div className="flex-1 p-3 space-y-4">
                {categoriesList.map((cat, catIdx) => {
                  const filteredItems = navigationItems.filter(item => 
                    item.category === cat && 
                    item.label.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={catIdx} className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-600/70 uppercase tracking-widest px-3 block mb-1">
                        {cat}
                      </span>
                      <div className="space-y-0.5">
                        {filteredItems.map(item => {
                          const IconComp = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setSelectedInvoiceDetail(null);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                                isActive 
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Badge */}
              <div className="p-4 border-t border-slate-200 bg-slate-100/50 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>رخصة المنظومة: نشطة وعاملة 💚</span>
                <span>v3.5.0</span>
              </div>
            </aside>

            {/* LEFT SIDE: Dynamic Module Content Workspace */}
            <main className="flex-1 overflow-y-auto p-6 bg-white">
              
              {/* COMPANIES MODULE */}
              {activeTab === 'companies' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        <span>إدارة الشركات والمؤسسات</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تحديد المنشأة النشطة أو إضافة فرع أو سجل تجاري للمؤسسات المسجلة في حسابك</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {visibleCompanies.map((comp) => {
                      const isCurrent = comp.id === currentCompanyId;
                      return (
                        <div 
                          key={comp.id}
                          className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                            isCurrent 
                              ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-lg' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {isCurrent && (
                            <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-br-xl">
                              المؤسسة النشطة حالياً
                            </div>
                          )}

                          <div className="space-y-3.5">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                              <Building2 className="w-6 h-6" />
                            </div>

                            <div>
                              <h3 className="font-extrabold text-sm text-slate-800">{comp.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-1">الرقم الضريبي: {comp.vatNumber}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">السجل التجاري: {comp.crNumber}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getPlanBadgeStyle(comp.subscriptionPlan)}`}>
                                {getPlanNameArabic(comp.subscriptionPlan)}
                              </span>
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                ضريبة {comp.vatRate}%
                              </span>
                            </div>
                          </div>

                          <div className="pt-5 mt-4 border-t border-slate-100">
                            {isCurrent ? (
                              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600">
                                <Check className="w-4 h-4" />
                                <span>قيد العمل والبيع النشط</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCompanySwitch(comp.id)}
                                className="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                              >
                                تحويل للعمل على هذه المؤسسة
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBSCRIPTIONS MODULE */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        <span>الاشتراكات والفوترة والترقية</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">إدارة خطط اشتراكك الفعالة ومراقبة حدود المخزون والمنتجات المسموحة لكل باقة</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-full uppercase">الاشتراك الفعال</span>
                      <h3 className="font-extrabold text-lg text-slate-800">
                        {storeName} - {getPlanNameArabic(companies.find(c => c.id === currentCompanyId)?.subscriptionPlan)}
                      </h3>
                      <p className="text-xs text-slate-600">
                        تاريخ الانتهاء التلقائي: <strong className="font-black text-indigo-700">2027-07-09</strong> (تبقت سنة كاملة)
                      </p>
                      <p className="text-xs text-slate-500">
                        الحد الأقصى للمنتجات المضافة بالمخزن: <strong className="font-black text-slate-700">{companies.find(c => c.id === currentCompanyId)?.maxProductsLimit === 999999 ? 'لامحدود' : `${companies.find(c => c.id === currentCompanyId)?.maxProductsLimit} منتج`}</strong>
                      </p>
                    </div>

                    <div className="bg-white px-5 py-4 rounded-2xl border border-indigo-200/50 shadow-sm text-center min-w-[200px]">
                      <span className="text-xs font-bold text-slate-400 block">حالة التفعيل والربط</span>
                      <span className="text-base font-black text-emerald-600 mt-1 block">نشط ومفعل مع هيئة الزكاة ✅</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mt-8">ترقية الباقات المتوفرة لنظام قيد المحاسبي (QAYD)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                    {[
                      { key: 'free', name: 'الباقة المجانية', limit: '5 منتجات', price: '0 ر.س', desc: 'لتجربة النظام للمحلات الصغيرة جداً' },
                      { key: 'basic', name: 'باقة التموينات الأساسية', limit: '25 منتج', price: '99 ر.س / شهرياً', desc: 'مناسبة للمحلات الفردية والتموينات الصغيرة' },
                      { key: 'premium', name: 'الباقة الذهبية للمحلات', limit: '100 منتج', price: '299 ر.س / شهرياً', desc: 'مثالية للمطاعم، الكافيهات، والأنشطة المتوسطة' },
                      { key: 'enterprise', name: 'الباقة اللامحدودة للشركات', limit: 'منتجات لامحدودة', price: '599 ر.س / شهرياً', desc: 'سجلات وفروع متعددة ودعم محاسبي متقدم' }
                    ].map((plan) => {
                      const isCurrentPlan = companies.find(c => c.id === currentCompanyId)?.subscriptionPlan === plan.key;
                      return (
                        <div 
                          key={plan.key}
                          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                            isCurrentPlan 
                              ? 'border-indigo-600 ring-2 ring-indigo-600/5 bg-slate-50 shadow-sm' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <h4 className="font-black text-xs text-slate-800">{plan.name}</h4>
                            <span className="text-sm font-black text-indigo-600 mt-2 block">{plan.price}</span>
                            <div className="h-[1px] bg-slate-100 my-3"></div>
                            <p className="text-[11px] text-slate-600 font-medium mb-1">الحد: {plan.limit}</p>
                            <p className="text-[10px] text-slate-400">{plan.desc}</p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-100">
                            {isCurrentPlan ? (
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl block text-center">
                                باقتك النشطة الحالية
                              </span>
                            ) : (
                              <button
                                onClick={() => handleUpgradeSubscription(plan.key as any)}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                              >
                                ترقية / تحويل لهذه الباقة
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* USERS MODULE */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span>إدارة المستخدمين والموظفين</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تحديد الموظفين المصرح لهم بفتح نقطة البيع أو تعديل الحسابات</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddUser} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">اسم الموظف الكامل</label>
                      <input
                        type="text"
                        placeholder="مثال: صالح الرويلي"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">الصلاحية المسندة</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      >
                        <option value="admin">مدير النظام (Admin)</option>
                        <option value="cashier">كاشير نقطة بيع (Cashier)</option>
                        <option value="accountant">محاسب مالي (Accountant)</option>
                        <option value="stock">أمين مخازن (Stock)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">الفرع المرتبط</label>
                      <select
                        value={newUserBranch}
                        onChange={(e) => setNewUserBranch(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      >
                        {erpBranches.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة موظف جديد</span>
                    </button>
                  </form>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">اسم الموظف</th>
                          <th className="p-4">اسم المستخدم بالنظام</th>
                          <th className="p-4">الصلاحية</th>
                          <th className="p-4">الفرع النشط</th>
                          <th className="p-4">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erpUsers.map((user) => (
                          <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4 font-extrabold text-slate-800">{user.name}</td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{user.username}</td>
                            <td className="p-4">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-extrabold">
                                {user.role === 'admin' ? 'مدير نظام كامل' : user.role === 'cashier' ? 'كاشير' : user.role === 'accountant' ? 'محاسب مالي' : 'أمين مستودع'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">{user.branch}</td>
                            <td className="p-4">
                              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {user.status === 'active' ? 'نشط بالنظام' : 'معطل'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ROLES MODULE */}
              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-indigo-600" />
                        <span>الصلاحيات وأذونات المجموعات</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تقييد أو السماح لمجموعات الموظفين بالوصول إلى التقارير وتحديث الأسعار والمخازن</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {erpRoles.map((role) => (
                      <div key={role.id} className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                            <span>{role.arabicName}</span>
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Role: {role.name}</span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block mb-2">الصلاحيات الممنوحة لهذه المجموعة:</span>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: 'sales', label: 'إجراء مبيعات وفواتير نقاط البيع' },
                              { key: 'inventory', label: 'إدارة وتعديل المخازن والمنتجات' },
                              { key: 'reports', label: 'الاطلاع على التقارير المالية والتحليلية' },
                              { key: 'settings', label: 'إعدادات المنشأة والربط مع الزكاة' },
                              { key: 'users', label: 'إدارة وتفعيل حسابات الموظفين' },
                              { key: 'accounting', label: 'توليد ومراجعة القيود المحاسبية' },
                              { key: 'expenses', label: 'تسجيل وصرف المصروفات المالية' }
                            ].map((perm) => {
                              const hasPerm = role.permissions.includes(perm.key);
                              return (
                                <div key={perm.key} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                    hasPerm ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-transparent'
                                  }`}>
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                  <span className={`text-[11px] font-medium ${hasPerm ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                                    {perm.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BRANCHES MODULE */}
              {activeTab === 'branches' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        <span>إدارة فروع المؤسسة</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تتبع مستودعات وفروع البيع للشركة وتوزيع المخزون عليها</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddBranch} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">اسم الفرع / المستودع</label>
                      <input
                        type="text"
                        placeholder="مثال: فرع الرياض - المربع"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">المدينة</label>
                      <select
                        value={newBranchCity}
                        onChange={(e) => setNewBranchCity(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      >
                        <option value="الرياض">الرياض</option>
                        <option value="جدة">جدة</option>
                        <option value="الدمام">الدمام</option>
                        <option value="مكة المكرمة">مكة المكرمة</option>
                        <option value="المدينة المنورة">المدينة المنورة</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">رقم هاتف الفرع</label>
                      <input
                        type="text"
                        placeholder="011-XXXXXXX"
                        value={newBranchPhone}
                        onChange={(e) => setNewBranchPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افتتاح فرع جديد</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {erpBranches.map((br) => (
                      <div key={br.id} className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            br.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {br.status === 'active' ? 'نشط وقائم' : 'مغلق للصيانة'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800">{br.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-1">المدينة: {br.city}</p>
                          <p className="text-[11px] text-slate-400">الهاتف: {br.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CASH DRAWERS MODULE */}
              {activeTab === 'devices' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-600" />
                        <span>إدارة أجهزة الكاشير ونقاط البيع</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">مراقبة اتصال أجهزة مدى، الميزان الذكي، قارئ الباركود، وطابعات الإيصالات</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {devices.map((dev) => (
                      <div key={dev.id} className="p-5 border border-slate-200 rounded-2xl bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100">
                            <Cpu className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-800">{dev.arabicName}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">النوع: {dev.type} | الاتصال: {dev.connectionType}</p>
                            <p className="text-[11px] text-slate-400">الموديل: {dev.manufacturer} {dev.model}</p>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                            dev.status === 'connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}>
                            {dev.status === 'connected' ? 'متصل ومحمل' : 'غير متصل'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1.5">S/N: {dev.serialNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCTS MODULE */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        <span>قائمة سلع ومنتجات الشركة</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">استعراض وتعديل السلع النشطة، الباركود، وأسعار البيع والتكلفة للربح والخسارة</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">السلعة</th>
                          <th className="p-4">الباركود</th>
                          <th className="p-4">التصنيف</th>
                          <th className="p-4 text-left">سعر البيع</th>
                          <th className="p-4 text-left">التكلفة</th>
                          <th className="p-4 text-center">الرصيد بالمخزن</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => (
                          <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4 font-extrabold text-slate-800">{prod.name}</td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{prod.barcode}</td>
                            <td className="p-4 text-slate-600 font-medium">{prod.category}</td>
                            <td className="p-4 text-left font-mono font-bold text-slate-800">{prod.price.toFixed(2)} ر.س</td>
                            <td className="p-4 text-left font-mono text-slate-400">{(prod.costPrice || prod.price * 0.7).toFixed(2)} ر.س</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                prod.stock <= 3 ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {prod.stock} حبة
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATEGORIES MODULE */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <FolderTree className="w-5 h-5 text-indigo-600" />
                        <span>تصنيفات السلع</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">توزيع المنتجات والسلع داخل أقسام منظمة لتسهيل الكاشير والفرز</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['مأكولات ومخبوزات', 'مشروبات وعصائر', 'حلويات وتسالي', 'معلبات ومواد غذائية', 'خضار وفواكه طازجة', 'منتجات الحليب والألبان', 'قرطاسية ومستلزمات'].map((cat, idx) => {
                      const count = products.filter(p => p.category === cat || p.category.includes(cat)).length;
                      return (
                        <div key={idx} className="p-5 border border-slate-200 rounded-2xl bg-white text-center space-y-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                            <FolderTree className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800">{cat}</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 inline-block mt-2 font-black">
                              {count} منتجات نشطة
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUPPLIERS MODULE */}
              {activeTab === 'suppliers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-indigo-600" />
                        <span>إدارة الموردين والمشتريات</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تسجيل الموردين المعتمدين لمتابعة الأرصدة المستحقة وسندات التوريد</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddSupplier} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">اسم المورد / الشركة</label>
                      <input
                        type="text"
                        placeholder="مثال: شركة سدافكو"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">مسؤول التواصل</label>
                      <input
                        type="text"
                        placeholder="أحمد علي"
                        value={newSupplierContact}
                        onChange={(e) => setNewSupplierContact(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">الهاتف</label>
                      <input
                        type="text"
                        placeholder="05XXXXXXXX"
                        value={newSupplierPhone}
                        onChange={(e) => setNewSupplierPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">الرصيد المستحق (ر.س)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newSupplierBalance === 0 ? '' : newSupplierBalance}
                        onChange={(e) => setNewSupplierBalance(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة مورد</span>
                    </button>
                  </form>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">اسم المورد</th>
                          <th className="p-4">الشخص المسؤول</th>
                          <th className="p-4">التصنيف المورد</th>
                          <th className="p-4">الهاتف</th>
                          <th className="p-4 text-left">الرصيد المالي المتبقي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erpSuppliers.map((sup) => (
                          <tr key={sup.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4 font-extrabold text-slate-800">{sup.name}</td>
                            <td className="p-4 text-slate-600 font-medium">{sup.contactPerson}</td>
                            <td className="p-4 text-slate-500">{sup.category}</td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{sup.phone}</td>
                            <td className="p-4 text-left font-mono font-bold text-rose-600">{sup.balance.toFixed(2)} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CUSTOMERS MODULE */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        <span>إدارة العملاء ونقاط الولاء</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تتبع نقاط ولاء عملائك المسجلين والبيع الآجل</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddCustomer} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">اسم العميل الثلاثي</label>
                      <input
                        type="text"
                        placeholder="مثال: عبد الرحمن الشهري"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">رقم هاتف الجوال</label>
                      <input
                        type="text"
                        placeholder="05XXXXXXXX"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">الرصيد الآجل الأولي إن وجد</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCustomerBalance === 0 ? '' : newCustomerBalance}
                        onChange={(e) => setNewCustomerBalance(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>تسجيل عميل</span>
                    </button>
                  </form>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">اسم العميل</th>
                          <th className="p-4">الجوال</th>
                          <th className="p-4 text-center">نقاط الولاء الفعالة</th>
                          <th className="p-4 text-left">الرصيد المدين/الدائن</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erpCustomers.map((cust) => (
                          <tr key={cust.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4 font-extrabold text-slate-800">{cust.name}</td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{cust.phone}</td>
                            <td className="p-4 text-center">
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-0.5 rounded-full font-black text-[10px]">
                                ⭐ {cust.points} نقطة
                              </span>
                            </td>
                            <td className={`p-4 text-left font-mono font-bold ${cust.balance >= 0 ? 'text-slate-700' : 'text-emerald-600'}`}>
                              {cust.balance.toFixed(2)} ر.س
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* INVENTORY MODULE */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-indigo-600" />
                        <span>مراقبة وتعديل المخزون</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تعديل المخزون مباشرة، توريد سلع جديدة، وتحديد إنذارات تدني الأرصدة</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((prod) => (
                      <div key={prod.id} className="p-4 border border-slate-200 rounded-2xl bg-white flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800">{prod.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">القسم: {prod.category} | باركود: {prod.barcode}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-bold text-slate-500">الرصيد:</span>
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                              prod.stock <= 3 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {prod.stock} حبة
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockAdjust(prod.id, -1)}
                            className="w-8 h-8 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleStockAdjust(prod.id, 5)}
                            className="w-8 h-8 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleStockAdjust(prod.id, 20)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            توريد كرتونة (+20)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INVOICES MODULE */}
              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                        <span>سجل فواتير المبيعات الصادرة</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">قائمة بالفواتير المصدرة من جهاز الكاشير مع تفاصيل الضريبة وطرق الدفع</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">رقم الفاتورة</th>
                          <th className="p-4">تاريخ الإصدار</th>
                          <th className="p-4 text-center">المنتجات</th>
                          <th className="p-4 text-left">الخصم</th>
                          <th className="p-4 text-left">الضريبة 15%</th>
                          <th className="p-4 text-left">المبلغ الإجمالي</th>
                          <th className="p-4 text-center">طريقة الدفع</th>
                          <th className="p-4 text-center">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                              لم يتم بيع أو تصدير أي فاتورة بعد في الوردية الحالية
                            </td>
                          </tr>
                        ) : (
                          orders.map((ord) => (
                            <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-4 font-mono font-black text-slate-800">{ord.invoiceNumber}</td>
                              <td className="p-4 text-slate-500">{new Date(ord.timestamp).toLocaleString('ar-SA')}</td>
                              <td className="p-4 text-center text-slate-600 font-bold">
                                {ord.items.reduce((acc, item) => acc + item.quantity, 0)} سلع
                              </td>
                              <td className="p-4 text-left font-mono text-slate-400">{ord.discount.toFixed(2)} ر.س</td>
                              <td className="p-4 text-left font-mono text-slate-500">{ord.vat.toFixed(2)} ر.س</td>
                              <td className="p-4 text-left font-mono font-black text-indigo-600">{ord.total.toFixed(2)} ر.س</td>
                              <td className="p-4 text-center">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-extrabold">
                                  {ord.paymentMethod === 'cash' ? '💵 كاش' : ord.paymentMethod === 'mada' ? '💳 مدى' : '💳 شبكة أخرى'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setSelectedInvoiceDetail(ord)}
                                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  تفاصيل الفاتورة 🔍
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Dynamic invoice detail overlay modal */}
                  {selectedInvoiceDetail && (
                    <div className="fixed inset-0 z-[60] bg-slate-900/40 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl relative">
                        <button
                          onClick={() => setSelectedInvoiceDetail(null)}
                          className="absolute top-4 left-4 p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-4">
                          <h3 className="font-black text-slate-800 text-sm">تفاصيل الفاتورة رقم: {selectedInvoiceDetail.invoiceNumber}</h3>
                          <div className="border-t border-b border-dashed border-slate-200 py-3 text-right space-y-2 text-xs">
                            <p className="text-slate-400">التاريخ والوقت: <span className="text-slate-800 font-mono font-bold">{new Date(selectedInvoiceDetail.timestamp).toLocaleString('ar-SA')}</span></p>
                            <p className="text-slate-400">بواسطة الكاشير: <span className="text-slate-800 font-bold">سارة الدوسري</span></p>
                            
                            <div className="my-2 text-[11px] font-bold text-indigo-600">بنود الفاتورة:</div>
                            {selectedInvoiceDetail.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-slate-600 font-medium">
                                <span>{item.product.name} (x{item.quantity})</span>
                                <span className="font-mono">{(item.product.price * item.quantity).toFixed(2)} ر.س</span>
                              </div>
                            ))}

                            <div className="border-t border-slate-100 pt-2 space-y-1">
                              <div className="flex justify-between text-slate-500 font-bold">
                                <span>المجموع الفرعي:</span>
                                <span className="font-mono">{selectedInvoiceDetail.subtotal.toFixed(2)} ر.س</span>
                              </div>
                              <div className="flex justify-between text-slate-500 font-bold">
                                <span>الضريبة المضافة:</span>
                                <span className="font-mono">{selectedInvoiceDetail.vat.toFixed(2)} ر.s</span>
                              </div>
                              {selectedInvoiceDetail.discount > 0 && (
                                <div className="flex justify-between text-rose-500 font-bold">
                                  <span>خصم الفاتورة:</span>
                                  <span className="font-mono">-{selectedInvoiceDetail.discount.toFixed(2)} ر.س</span>
                                </div>
                              )}
                              <div className="flex justify-between text-indigo-700 font-black text-sm pt-1">
                                <span>الإجمالي النهائي:</span>
                                <span className="font-mono">{selectedInvoiceDetail.total.toFixed(2)} ر.س</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => handleRefundOrderInvoice(selectedInvoiceDetail.id)}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Undo2 className="w-4 h-4" />
                              <span>إرجاع هذه الفاتورة بالكامل</span>
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceDetail(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              إغلاق نافذة التفاصيل
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RETURNS MODULE */}
              {activeTab === 'returns' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Undo2 className="w-5 h-5 text-indigo-600" />
                        <span>إرجاع الفواتير والمرتجع المالي</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">سجل بالمرتجعات والسلع التي تم ردها للمخازن وإثبات القيود المحاسبية للمرتجعات</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                    <p className="text-xs text-slate-500">
                      يمكنك عمل مرتجع لأي فاتورة مباشرة من خلال البحث عنها في قسم <strong className="font-black text-indigo-600">"الفواتير الصادرة"</strong> ثم النقر على زر <strong className="font-bold">"إرجاع الفاتورة"</strong>. سيقوم النظام تلقائياً بـ:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                        1. إعادة كمية السلع للمخازن فوراً 📦
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                        2. تعديل رصيد الخزينة أو حساب البنك 💵
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                        3. توليد قيد محاسبي عكسي آلي للضريبة 🧮
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPENSES MODULE */}
              {activeTab === 'expenses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                        <span>المصروفات التشغيلية والعمومية</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تتبع بنود الصرف كالإيجارات، الرواتب، والمكتبية لمراقبة الهوامش الربحية بدقة</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddExpense} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">بيان المصروف</label>
                      <input
                        type="text"
                        placeholder="مثال: فاتورة الكهرباء فرع الرياض"
                        value={newExpenseTitle}
                        onChange={(e) => setNewExpenseTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">تصنيف المصروف</label>
                      <select
                        value={newExpenseCategory}
                        onChange={(e) => setNewExpenseCategory(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      >
                        <option value="رواتب وأجور">رواتب وأجور</option>
                        <option value="إيجارات">إيجارات</option>
                        <option value="مرافق عامة">مرافق عامة (كهرباء/ماء)</option>
                        <option value="مشتريات بضائع">مشتريات بضائع</option>
                        <option value="صيانة ومكتبية">صيانة وأدوات مكتبية</option>
                        <option value="مصاريف أخرى">مصاريف أخرى عامة</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">المبلغ المصروف (ر.س)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إثبات وصرف المصروف</span>
                    </button>
                  </form>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">بيان وصنف الصرف</th>
                          <th className="p-4">التصنيف المحاسبي</th>
                          <th className="p-4">تاريخ الصرف</th>
                          <th className="p-4 text-left">المبلغ المصروف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erpExpenses.map((exp) => (
                          <tr key={exp.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4 font-extrabold text-slate-800">{exp.title}</td>
                            <td className="p-4 text-slate-600">
                              <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded font-extrabold">
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{exp.date}</td>
                            <td className="p-4 text-left font-mono font-bold text-rose-600">{exp.amount.toFixed(2)} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SAFES MODULE */}
              {activeTab === 'safes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Vault className="w-5 h-5 text-indigo-600" />
                        <span>إدارة الخزن النقدية وأدراج الكاشير</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تعديل أرصدة الصناديق، إثبات أوامر السحب والإيداع والتسويات المالية اليومية</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSafeAction(e, true)} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">الخزينة المستهدفة</label>
                      <select
                        value={depositSafeId}
                        onChange={(e) => setDepositSafeId(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      >
                        {erpSafes.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (الرصيد: {s.balance.toFixed(2)} ر.س)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">المبلغ المالي</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">ملاحظة التسوية</label>
                      <input
                        type="text"
                        placeholder="مثال: تسوية عجز نقدي / توريد سيولة"
                        value={depositNote}
                        onChange={(e) => setDepositNote(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-right font-medium"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        إيداع نقدي 📥
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSafeAction(e, false)}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        سحب مالي 📤
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {erpSafes.map((safe) => (
                      <div key={safe.id} className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Vault className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold uppercase">
                            {safe.type === 'safe' ? 'خزنة مركزية' : 'درج كاشير'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-xs text-slate-500 block">{safe.name}</h3>
                          <span className="font-mono text-base font-black text-indigo-600 mt-2 block">
                            {safe.balance.toFixed(2)} ر.س
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCOUNTING ENTRIES MODULE */}
              {activeTab === 'accounting' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-indigo-600" />
                        <span>القيود المحاسبية الختامية (Double-Entry)</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">توليد تلقائي لقيود الدائن والمدين لتسجيل دورة المبيعات والضريبة والمصروفات بالمنشأة</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">التاريخ</th>
                          <th className="p-4">البيان والشرح للمستند</th>
                          <th className="p-4">الطرف المدين (Debit)</th>
                          <th className="p-4 text-left">مبلغ المدين</th>
                          <th className="p-4">الطرف الدائن (Credit)</th>
                          <th className="p-4 text-left">مبلغ الدائن</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erpJournalEntries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                              لا توجد قيود يومية مسجلة حالياً. ابدأ ببيع المنتجات أو إضافة مصروفات.
                            </td>
                          </tr>
                        ) : (
                          erpJournalEntries.map((je, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-4 font-mono text-slate-500">{je.date}</td>
                              <td className="p-4 font-bold text-slate-800">{je.description}</td>
                              <td className="p-4 text-blue-700 font-bold">{je.debitAccount}</td>
                              <td className="p-4 text-left font-mono font-bold text-blue-700">{je.debitAmount.toFixed(2)} ر.س</td>
                              <td className="p-4 text-emerald-700 font-bold">{je.creditAccount}</td>
                              <td className="p-4 text-left font-mono font-bold text-emerald-700">{je.creditAmount.toFixed(2)} ر.س</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AUDIT LOGS MODULE */}
              {activeTab === 'audit_logs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-indigo-600" />
                        <span>سجل العمليات والرقابة (Audit Trail)</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تتبع كافة العمليات والنشاطات التي قام بها الموظفون داخل النظام لضمان النزاهة والتحقق</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">الوقت والتاريخ</th>
                          <th className="p-4">الموظف / المسؤول</th>
                          <th className="p-4">النشاط والإجراء المتخذ</th>
                          <th className="p-4 text-center">النظام</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erpActivityLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString('ar-SA')}</td>
                            <td className="p-4 font-extrabold text-slate-700">{log.user}</td>
                            <td className="p-4 text-slate-600 font-medium">{log.action}</td>
                            <td className="p-4 text-center">
                              <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                                QAYD Core
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SETTINGS MODULE */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-indigo-600" />
                        <span>إعدادات النظام العامة</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تعديل الإعدادات الأساسية لضريبة القيمة المضافة، السجل التجاري، والربط الإلكتروني</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-black text-slate-700 block mb-1.5">اسم المتجر / الشركة التجاري</label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full text-xs px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-right font-extrabold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-700 block mb-1.5">نسبة ضريبة القيمة المضافة (VAT %)</label>
                        <input
                          type="number"
                          value={storeVatRate}
                          onChange={(e) => setStoreVatRate(Number(e.target.value))}
                          className="w-full text-xs px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-right font-extrabold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-700 block mb-1.5">الرقم الضريبي المعتمد لدى الهيئة (15 خانة)</label>
                        <input
                          type="text"
                          value={storeVat}
                          onChange={(e) => setStoreVat(e.target.value)}
                          className="w-full text-xs px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-right font-mono font-black text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-700 block mb-1.5">السجل التجاري للمؤسسة (CR Number)</label>
                        <input
                          type="text"
                          value={storeCr}
                          onChange={(e) => setStoreCr(e.target.value)}
                          className="w-full text-xs px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-right font-mono font-black text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          addToast('تم حفظ وتحديث إعدادات منظومة قيد (QAYD) بنجاح! 💾', 'success');
                          addLog('أحمد القحطاني', 'تحديث إعدادات الضريبة والسجل للمنشأة التجارية');
                        }}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REPORTS MODULE */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <span>تقارير الأداء المالي والربحية</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">تقارير بيانية عن المبيعات اليومية والمصروفات والأرباح الصافية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales vs Expenses chart */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                      <h4 className="text-xs font-black text-slate-700">مقارنة المبيعات بالمصروفات التشغيلية (ر.س)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'التموين والمبيعات', مبيعات: totalInvoicesValue, مصروفات: totalExpensesValue }
                            ]}
                            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="مبيعات" fill="#059669" name="المبيعات الإجمالية" />
                            <Bar dataKey="مصروفات" fill="#e11d48" name="المصروفات المثبتة" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Products Distribution */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                      <h4 className="text-xs font-black text-slate-700">توزيع مخزون المنتجات حسب الكمية النشطة</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={products.slice(0, 8).map(p => ({
                              name: p.name.substring(0, 10),
                              المخزون: p.stock
                            }))}
                            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="المخزون" stroke="#4f46e5" fill="#e0e7ff" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
