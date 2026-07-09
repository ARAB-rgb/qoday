/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Barcode, ClipboardList, 
  Printer, History, Sparkles, Coins, CreditCard, Search, 
  RotateCcw, ShieldCheck, Check, Apple, Utensils, CupSoda, 
  Cookie, Sparkle, Camera, HelpCircle, Package, Layers, Gift,
  Cpu, Scale, X, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import { Product, CartItem, PaymentMethod, Order, Toast, HardwareDevice, Company } from './types';
import { DEFAULT_PRODUCTS, CATEGORIES } from './data/defaultProducts';
import ToastContainer from './components/ToastContainer';
import Receipt from './components/Receipt';
import CameraScanner from './components/CameraScanner';
import PaymentTerminal from './components/PaymentTerminal';
import ProductManager from './components/ProductManager';
import OrderHistory from './components/OrderHistory';
import DeviceManager from './components/DeviceManager';
import CompanyManager from './components/CompanyManager';
import QaydDashboard from './components/QaydDashboard';
import QaydLogo from './components/QaydLogo';
import { LanguageCode, LANGUAGES, t, translateProduct, translateCategory } from './lib/translations';

const INITIAL_DEVICES: HardwareDevice[] = [
  {
    id: 'dev-scale',
    name: 'Smart Weight Scale',
    arabicName: 'الميزان الإلكتروني الذكي',
    type: 'scale',
    status: 'connected',
    connectionType: 'Serial (COM)',
    portOrIp: 'COM4',
    manufacturer: 'Mettler Toledo',
    model: 'Bactra-200',
    serialNumber: 'MT-88492019-X',
    lastActive: Date.now()
  },
  {
    id: 'dev-scanner',
    name: 'Laser Barcode Scanner',
    arabicName: 'قارئ الباركود الليزري',
    type: 'scanner',
    status: 'connected',
    connectionType: 'USB',
    portOrIp: 'USB Port 2',
    manufacturer: 'Honeywell',
    model: 'Xenon 1900g',
    serialNumber: 'HW-99201944-A',
    lastActive: Date.now()
  },
  {
    id: 'dev-printer',
    name: 'Thermal Receipt Printer',
    arabicName: 'طابعة الإيصالات الحرارية',
    type: 'printer',
    status: 'connected',
    connectionType: 'Wi-Fi',
    portOrIp: '192.168.1.185',
    manufacturer: 'Epson',
    model: 'TM-T88VI',
    serialNumber: 'EP-55102049-P',
    lastActive: Date.now()
  },
  {
    id: 'dev-terminal',
    name: 'Mada Payment Terminal',
    arabicName: 'جهاز دفع مدى (نقاط البيع)',
    type: 'terminal',
    status: 'connected',
    connectionType: 'Wi-Fi',
    portOrIp: '192.168.1.105',
    manufacturer: 'Verifone',
    model: 'V200c Mada',
    serialNumber: 'VF-77291034-T',
    lastActive: Date.now()
  }
];

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'بقالة البركة والخيرات',
    vatNumber: '300055443300003',
    crNumber: '1010000000',
    vatRate: 15,
    welcomeMsg: 'نشكركم لتسوقكم معنا في بقالة البركة والخيرات!',
    subscriptionPlan: 'premium',
    subscriptionExpiry: '2027-01-01',
    maxProductsLimit: 100
  },
  {
    id: 'comp-2',
    name: 'أسواق ومخابز الياسمين',
    vatNumber: '311188442200003',
    crNumber: '1010444555',
    vatRate: 15,
    welcomeMsg: 'أسواق ومخابز الياسمين ترحب بكم وتتمنى لكم يوماً سعيداً!',
    subscriptionPlan: 'basic',
    subscriptionExpiry: '2026-12-15',
    maxProductsLimit: 25
  },
  {
    id: 'comp-3',
    name: 'سوبرماركت النخبة الراقية',
    vatNumber: '300099887700003',
    crNumber: '1010888999',
    vatRate: 15,
    welcomeMsg: 'عميلنا العزيز، نشكر لك ثقتك في النخبة الراقية!',
    subscriptionPlan: 'free',
    subscriptionExpiry: '2026-08-01',
    maxProductsLimit: 5
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

export default function App() {
  // --- Multi-Company / Multi-Tenant State ---
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('pos_companies');
      return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
    } catch (e) {
      console.error("Failed to parse pos_companies:", e);
      return INITIAL_COMPANIES;
    }
  });

  const [currentCompanyId, setCurrentCompanyId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('pos_current_company_id');
      return saved || 'comp-1';
    } catch (e) {
      return 'comp-1';
    }
  });

  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState<boolean>(false);

  // --- Supabase Cloud Sync State ---
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(false);
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'not_set'>('idle');
  const [supabaseErrorType, setSupabaseErrorType] = useState<'TABLE_NOT_FOUND' | 'OTHER' | null>(null);
  const [isSupabaseSyncEnabled, setIsSupabaseSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pos_supabase_sync_enabled');
      return saved !== 'false'; // default to true if not set
    } catch (e) {
      return true;
    }
  });

  // --- Persistent Storage State ---
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      // Check if namespaced products exist, otherwise migrate or seed
      const companyId = localStorage.getItem('pos_current_company_id') || 'comp-1';
      
      // Migration: If we have old non-namespaced pos_products but no namespaced ones, copy it over!
      const oldProducts = localStorage.getItem('pos_products');
      if (oldProducts && !localStorage.getItem(`pos_products_${companyId}`)) {
        localStorage.setItem(`pos_products_${companyId}`, oldProducts);
      }

      const saved = localStorage.getItem(`pos_products_${companyId}`);
      const rawList: Product[] = saved ? JSON.parse(saved) : (companyId === 'comp-1' ? DEFAULT_PRODUCTS : DEFAULT_PRODUCTS.slice(0, 8));
      const seenIds = new Set<string>();
      let hasUpdated = false;
      const sanitized = rawList.map((prod, idx) => {
        let finalId = prod.id;
        if (!finalId || seenIds.has(finalId)) {
          const randomSuffix = Math.random().toString(36).substring(2, 9);
          finalId = `prod-${Date.now()}-${idx}-${randomSuffix}`;
          hasUpdated = true;
        }
        seenIds.add(finalId);
        return { ...prod, id: finalId };
      });
      if (hasUpdated) {
        localStorage.setItem(`pos_products_${companyId}`, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch (e) {
      console.error("Failed to parse products:", e);
      return DEFAULT_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const companyId = localStorage.getItem('pos_current_company_id') || 'comp-1';

      // Migration for orders
      const oldOrders = localStorage.getItem('pos_orders');
      if (oldOrders && !localStorage.getItem(`pos_orders_${companyId}`)) {
        localStorage.setItem(`pos_orders_${companyId}`, oldOrders);
      }

      const saved = localStorage.getItem(`pos_orders_${companyId}`);
      const rawOrders: Order[] = saved ? JSON.parse(saved) : [];
      const seenOrderIds = new Set<string>();
      let hasUpdated = false;
      const sanitized = rawOrders.map((ord, idx) => {
        let finalId = ord.id;
        if (!finalId || seenOrderIds.has(finalId)) {
          finalId = `order-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
          hasUpdated = true;
        }
        seenOrderIds.add(finalId);
        return { ...ord, id: finalId };
      });
      if (hasUpdated) {
        localStorage.setItem(`pos_orders_${companyId}`, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch (e) {
      console.error("Failed to parse orders:", e);
      return [];
    }
  });

  // --- POS Session State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('pos_lang');
    return (saved as LanguageCode) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('pos_lang', currentLang);
  }, [currentLang]);

  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);

  // --- Hardware Connections & Simulation State ---
  const [devices, setDevices] = useState<HardwareDevice[]>(() => {
    try {
      const saved = localStorage.getItem('pos_devices');
      return saved ? JSON.parse(saved) : INITIAL_DEVICES;
    } catch (e) {
      console.error("Failed to parse pos_devices:", e);
      return INITIAL_DEVICES;
    }
  });
  const [scaleWeight, setScaleWeight] = useState<number>(1.45); // default mock weight of 1.45 kg
  const [isDeviceManagerOpen, setIsDeviceManagerOpen] = useState<boolean>(false);

  // Keyboard Wedge configuration states
  const [wedgeEnabled, setWedgeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('pos_wedge_enabled');
    return saved !== 'false'; // Defaults to true
  });
  const [wedgePrefix, setWedgePrefix] = useState<string>(() => {
    return localStorage.getItem('pos_wedge_prefix') || '';
  });
  const [wedgeSuffix, setWedgeSuffix] = useState<string>(() => {
    return localStorage.getItem('pos_wedge_suffix') || 'Enter';
  });

  // Custom print settings states
  const [storeName, setStoreName] = useState<string>(() => {
    return localStorage.getItem('pos_store_name') || 'بقالة البركة والخيرات';
  });
  const [storeVat, setStoreVat] = useState<string>(() => {
    return localStorage.getItem('pos_store_vat') || '300055443300003';
  });
  const [storeCr, setStoreCr] = useState<string>(() => {
    return localStorage.getItem('pos_store_cr') || '1010000000';
  });
  const [storeVatRate, setStoreVatRate] = useState<number>(() => {
    const saved = localStorage.getItem('pos_store_vat_rate');
    return saved ? parseFloat(saved) : 15;
  });
  const [welcomeMsg, setWelcomeMsg] = useState<string>(() => {
    return localStorage.getItem('pos_welcome_msg') || 'نشكركم لتسوقكم معنا!';
  });

  const [isCashierSettingsOpen, setIsCashierSettingsOpen] = useState<boolean>(false);

  // --- Modal & Tool Panels State ---
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isQaydDashboardOpen, setIsQaydDashboardOpen] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState<boolean>(false);

  // --- PWA Installation states ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // --- Toasts system ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Refs ---
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize companies to localStorage
  useEffect(() => {
    localStorage.setItem('pos_companies', JSON.stringify(companies));
  }, [companies]);

  // Synchronize selected company ID to localStorage
  useEffect(() => {
    localStorage.setItem('pos_current_company_id', currentCompanyId);
  }, [currentCompanyId]);

  // Synchronize products to company-specific localStorage
  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_products_${currentCompanyId}`, JSON.stringify(products));
    }
  }, [products, currentCompanyId]);

  // Synchronize orders to company-specific localStorage
  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`pos_orders_${currentCompanyId}`, JSON.stringify(orders));
    }
  }, [orders, currentCompanyId]);

  // Handle switching company: load correct values
  useEffect(() => {
    const comp = companies.find(c => c.id === currentCompanyId);
    if (comp) {
      setStoreName(comp.name);
      setStoreVat(comp.vatNumber);
      setStoreCr(comp.crNumber);
      setStoreVatRate(comp.vatRate);
      setWelcomeMsg(comp.welcomeMsg);

      const savedProducts = localStorage.getItem(`pos_products_${currentCompanyId}`);
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error("Failed to parse savedProducts during switch:", e);
          if (currentCompanyId === 'comp-1') {
            setProducts(DEFAULT_PRODUCTS);
          } else if (currentCompanyId === 'comp-2') {
            setProducts(DEFAULT_PRODUCTS.slice(0, 12));
          } else if (currentCompanyId === 'comp-3') {
            setProducts(DEFAULT_PRODUCTS.slice(0, 5));
          } else {
            setProducts(DEFAULT_PRODUCTS.slice(0, 3));
          }
        }
      } else {
        if (currentCompanyId === 'comp-1') {
          setProducts(DEFAULT_PRODUCTS);
        } else if (currentCompanyId === 'comp-2') {
          setProducts(DEFAULT_PRODUCTS.slice(0, 12));
        } else if (currentCompanyId === 'comp-3') {
          setProducts(DEFAULT_PRODUCTS.slice(0, 5));
        } else {
          setProducts(DEFAULT_PRODUCTS.slice(0, 3));
        }
      }

      const savedOrders = localStorage.getItem(`pos_orders_${currentCompanyId}`);
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (e) {
          console.error("Failed to parse savedOrders during switch:", e);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    }
  }, [currentCompanyId]);

  // Keep the current company's metadata in 'companies' in sync with active settings fields
  useEffect(() => {
    setCompanies(prev => prev.map(c => {
      if (c.id === currentCompanyId) {
        return {
          ...c,
          name: storeName,
          vatNumber: storeVat,
          crNumber: storeCr,
          vatRate: storeVatRate,
          welcomeMsg: welcomeMsg
        };
      }
      return c;
    }));
  }, [storeName, storeVat, storeCr, storeVatRate, welcomeMsg, currentCompanyId]);

  // Synchronize hardware devices state to localStorage
  useEffect(() => {
    localStorage.setItem('pos_devices', JSON.stringify(devices));
  }, [devices]);

  // Synchronize keyboard wedge settings to localStorage
  useEffect(() => {
    localStorage.setItem('pos_wedge_enabled', String(wedgeEnabled));
  }, [wedgeEnabled]);

  useEffect(() => {
    localStorage.setItem('pos_wedge_prefix', wedgePrefix);
  }, [wedgePrefix]);

  useEffect(() => {
    localStorage.setItem('pos_wedge_suffix', wedgeSuffix);
  }, [wedgeSuffix]);

  // Synchronize custom print settings to localStorage
  useEffect(() => {
    localStorage.setItem('pos_store_name', storeName);
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('pos_store_vat', storeVat);
  }, [storeVat]);

  useEffect(() => {
    localStorage.setItem('pos_store_cr', storeCr);
  }, [storeCr]);

  useEffect(() => {
    localStorage.setItem('pos_store_vat_rate', storeVatRate.toString());
  }, [storeVatRate]);

  useEffect(() => {
    localStorage.setItem('pos_welcome_msg', welcomeMsg);
  }, [welcomeMsg]);

  // --- Supabase Cloud Sync Methods & Effects ---
  
  // Persist sync toggle
  useEffect(() => {
    localStorage.setItem('pos_supabase_sync_enabled', isSupabaseSyncEnabled.toString());
  }, [isSupabaseSyncEnabled]);

  const loadAllFromSupabase = async () => {
    setSupabaseSyncStatus('syncing');
    try {
      // 1. Fetch companies
      const resComp = await fetch('/api/supabase/companies');
      if (!resComp.ok) {
        const errData = await resComp.json();
        if (errData.errorType === 'TABLE_NOT_FOUND') {
          setSupabaseErrorType('TABLE_NOT_FOUND');
          setSupabaseSyncStatus('error');
          return;
        }
        throw new Error(errData.error || "Failed to fetch companies");
      }
      const dataComp = await resComp.json();
      if (dataComp.companies && dataComp.companies.length > 0) {
        setCompanies(dataComp.companies);
        
        // Find if current company is inside
        const activeId = localStorage.getItem('pos_current_company_id') || 'comp-1';
        const hasActive = dataComp.companies.some((c: any) => c.id === activeId);
        const finalActiveId = hasActive ? activeId : dataComp.companies[0].id;
        if (finalActiveId !== activeId) {
          setCurrentCompanyId(finalActiveId);
        }
      }

      // 2. Fetch products for current active company
      const activeId = localStorage.getItem('pos_current_company_id') || 'comp-1';
      const resProd = await fetch(`/api/supabase/products?companyId=${activeId}`);
      if (resProd.ok) {
        const dataProd = await resProd.json();
        if (dataProd.products && dataProd.products.length > 0) {
          setProducts(dataProd.products);
        }
      }

      // 3. Fetch orders for current active company
      const resOrd = await fetch(`/api/supabase/orders?companyId=${activeId}`);
      if (resOrd.ok) {
        const dataOrd = await resOrd.json();
        if (dataOrd.orders && dataOrd.orders.length > 0) {
          setOrders(dataOrd.orders);
        }
      }

      setSupabaseSyncStatus('synced');
      setSupabaseErrorType(null);
    } catch (err: any) {
      console.error("Supabase load error:", err);
      setSupabaseSyncStatus('error');
    }
  };

  const syncAllWithSupabase = async (
    targetCompanies = companies,
    targetProducts = products,
    targetOrders = orders,
    targetCompanyId = currentCompanyId
  ) => {
    if (!supabaseConfigured || !isSupabaseSyncEnabled) return;
    setSupabaseSyncStatus('syncing');
    try {
      // 1. Sync companies
      const resComp = await fetch('/api/supabase/sync-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: targetCompanies })
      });
      if (!resComp.ok) {
        const errData = await resComp.json();
        if (errData.errorType === 'TABLE_NOT_FOUND') {
          setSupabaseErrorType('TABLE_NOT_FOUND');
          setSupabaseSyncStatus('error');
          return;
        }
        throw new Error(errData.error || "Failed to sync companies");
      }

      // 2. Sync products
      if (targetCompanyId) {
        const resProd = await fetch('/api/supabase/sync-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: targetProducts, companyId: targetCompanyId })
        });
        if (!resProd.ok) {
          const errData = await resProd.json();
          if (errData.errorType === 'TABLE_NOT_FOUND') {
            setSupabaseErrorType('TABLE_NOT_FOUND');
            setSupabaseSyncStatus('error');
            return;
          }
          throw new Error(errData.error || "Failed to sync products");
        }

        // 3. Sync orders
        const resOrd = await fetch('/api/supabase/sync-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orders: targetOrders, companyId: targetCompanyId })
        });
        if (!resOrd.ok) {
          const errData = await resOrd.json();
          if (errData.errorType === 'TABLE_NOT_FOUND') {
            setSupabaseErrorType('TABLE_NOT_FOUND');
            setSupabaseSyncStatus('error');
            return;
          }
          throw new Error(errData.error || "Failed to sync orders");
        }
      }

      setSupabaseSyncStatus('synced');
      setSupabaseErrorType(null);
    } catch (err: any) {
      console.error("Supabase sync error:", err);
      setSupabaseSyncStatus('error');
    }
  };

  // Check Supabase configuration status on load
  useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        const res = await fetch('/api/supabase/config');
        const data = await res.json();
        if (data.configured) {
          setSupabaseConfigured(true);
          if (isSupabaseSyncEnabled) {
            // Wait slightly for local states to settle
            setTimeout(() => {
              loadAllFromSupabase();
            }, 300);
          }
        } else {
          setSupabaseConfigured(false);
          setSupabaseSyncStatus('not_set');
        }
      } catch (err) {
        console.error("Failed to check Supabase config:", err);
        setSupabaseSyncStatus('error');
      }
    };
    checkSupabaseConfig();
  }, [isSupabaseSyncEnabled]);

  // Handle switching company or initial change - fetch company data
  useEffect(() => {
    if (supabaseConfigured && isSupabaseSyncEnabled && currentCompanyId) {
      const fetchCompanySpecifics = async () => {
        setSupabaseSyncStatus('syncing');
        try {
          // Fetch products
          const resProd = await fetch(`/api/supabase/products?companyId=${currentCompanyId}`);
          if (!resProd.ok) {
            const dataProdErr = await resProd.json();
            if (dataProdErr.errorType === 'TABLE_NOT_FOUND') {
              setSupabaseErrorType('TABLE_NOT_FOUND');
              setSupabaseSyncStatus('error');
              return;
            }
            throw new Error(dataProdErr.error || "Failed to fetch products");
          }
          const dataProd = await resProd.json();
          if (dataProd.products) {
            setProducts(dataProd.products);
          }

          // Fetch orders
          const resOrd = await fetch(`/api/supabase/orders?companyId=${currentCompanyId}`);
          if (!resOrd.ok) {
            const dataOrdErr = await resOrd.json();
            if (dataOrdErr.errorType === 'TABLE_NOT_FOUND') {
              setSupabaseErrorType('TABLE_NOT_FOUND');
              setSupabaseSyncStatus('error');
              return;
            }
            throw new Error(dataOrdErr.error || "Failed to fetch orders");
          }
          const dataOrd = await resOrd.json();
          if (dataOrd.orders) {
            setOrders(dataOrd.orders);
          }
          setSupabaseSyncStatus('synced');
          setSupabaseErrorType(null);
        } catch (err) {
          console.error("Failed to fetch company specifics:", err);
          setSupabaseSyncStatus('error');
        }
      };
      fetchCompanySpecifics();
    }
  }, [currentCompanyId, supabaseConfigured, isSupabaseSyncEnabled]);

  // Auto-sync products/orders/companies when they are modified
  // We use primitive dependencies or single events to trigger this safely
  useEffect(() => {
    if (supabaseConfigured && isSupabaseSyncEnabled) {
      const delayDebounce = setTimeout(() => {
        syncAllWithSupabase(companies, products, orders, currentCompanyId);
      }, 1500); // 1.5s debounce to save API requests
      return () => clearTimeout(delayDebounce);
    }
  }, [products.length, orders.length, companies.length, supabaseConfigured, isSupabaseSyncEnabled]);

  // Focus barcode input on mount and whenever modals close
  useEffect(() => {
    if (!isScannerOpen && !isTerminalOpen && !isProductManagerOpen && !isHistoryOpen && !activeReceiptOrder && !isDeviceManagerOpen && !isCashierSettingsOpen) {
      setTimeout(() => barcodeInputRef.current?.focus(), 200);
    }
  }, [isScannerOpen, isTerminalOpen, isProductManagerOpen, isHistoryOpen, activeReceiptOrder, isDeviceManagerOpen, isCashierSettingsOpen]);

  // Listen for simulated hardware physical barcode scans from DeviceManager
  useEffect(() => {
    const handlePhysicalScan = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const scannedCode = customEvent.detail;
      if (scannedCode) {
        const matched = products.find(p => p.barcode === scannedCode);
        if (matched) {
          handleAddToCart(matched);
        }
      }
    };

    window.addEventListener('physical-barcode-scan', handlePhysicalScan);
    return () => {
      window.removeEventListener('physical-barcode-scan', handlePhysicalScan);
    };
  }, [products, devices, scaleWeight]);

  // --- Keyboard Wedge Barcode Scanner Listener ---
  useEffect(() => {
    if (!wedgeEnabled) return;

    let buffer = '';
    let lastKeyTime = 0;
    let prefixMatched = wedgePrefix === ''; // If prefix is empty, it's always matched from the start

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore functional/modifier keys on their own (unless they are explicitly set as prefix/suffix)
      if (
        (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'CapsLock' || e.key === 'Escape') &&
        e.key !== wedgePrefix && e.key !== wedgeSuffix
      ) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTime;
      lastKeyTime = now;

      // Detect if focus is inside any text input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Scanner typing speed is extremely fast (generally < 45ms per key)
      const isFastTyping = timeDiff < 45;

      // If we are in an input but not typing fast, and there is no prefix, do not hijack normal user typing
      if (isInput && !isFastTyping && wedgePrefix === '') {
        buffer = ''; // reset buffer
        return;
      }

      // Check if current key matches the prefix
      if (wedgePrefix && e.key === wedgePrefix) {
        prefixMatched = true;
        buffer = ''; // clear buffer for new scan
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Check if current key matches the suffix
      if (e.key === wedgeSuffix) {
        if (prefixMatched && buffer.trim().length >= 3) {
          e.preventDefault();
          e.stopPropagation();
          
          const scannedCode = buffer.trim();
          buffer = '';
          if (wedgePrefix !== '') {
            prefixMatched = false; // reset prefix match state
          }

          // Trigger scan handler
          const matched = products.find((p) => p.barcode === scannedCode);
          if (matched) {
            handleAddToCart(matched);
            addToast(`[مسح تلقائي ⚡] تم رصد السلعة: "${matched.name}"`, 'success');
          } else {
            playErrorBuzz();
            addToast(`[مسح تلقائي ⚡] باركود غير مسجل: #${scannedCode}`, 'warning');
          }
        } else {
          buffer = '';
          if (wedgePrefix !== '') {
            prefixMatched = false;
          }
        }
        return;
      }

      // Collect key characters
      if (prefixMatched) {
        // Capture only printable single characters
        if (e.key.length === 1) {
          buffer += e.key;
          // Prevent standard output if it's scanner typing (fast) or we are not in an input,
          // to prevent barcode characters spilling into search bars or triggering accidental browser shortcuts
          if (isFastTyping || !isInput) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true); // use capture phase to hijack key events cleanly
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [wedgeEnabled, wedgePrefix, wedgeSuffix, products]);

  // --- Toast Management ---
  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check for low stock products on startup (stock <= 5)
  useEffect(() => {
    const lowStockItems = products.filter(p => p.stock <= 5);
    if (lowStockItems.length > 0) {
      const timer = setTimeout(() => {
        playErrorBuzz();
        
        if (lowStockItems.length === 1) {
          const item = lowStockItems[0];
          addToast(
            `تنبيه المخزون المنخفض: سلعة "${item.name}" شارف مخزونها على النفاد (${item.stock} قطع متبقية)! ⚠️`,
            'warning'
          );
        } else if (lowStockItems.length <= 3) {
          const names = lowStockItems.map(item => `"${item.name}" (${item.stock} قطع)`).join(' و ');
          addToast(
            `تنبيه المخزون المنخفض: السلع التالية شارف مخزونها على النفاد: ${names} ⚠️`,
            'warning'
          );
        } else {
          addToast(
            `تنبيه المخزون: هناك ${lowStockItems.length} سلع مختلفة مخزونها أقل من الحد الأدنى المسموح به (5 قطع)! يرجى إعادة تعبئة الرفوف ⚠️`,
            'warning'
          );
        }
      }, 1000); // Delayed slightly so it appears smoothly after the initial UI load animation
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Quick barcode scanner beep play helper ---
  const playCashierBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1050, audioCtx.currentTime); // standard scan chirp (C6)
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio feedback failed to play:', e);
    }
  };

  const playErrorBuzz = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // error buzz
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio feedback failed to play:', e);
    }
  };

  // --- Cart Actions ---
  const handleAddToCart = (product: Product, forceQuantity?: number) => {
    if (product.isUnavailable) {
      playErrorBuzz();
      addToast(`عذراً، سلعة "${product.name}" غير متوفرة حالياً بالبقالة!`, 'warning');
      return;
    }

    if (product.stock <= 0) {
      playErrorBuzz();
      addToast(`انتهى المخزون! سلعة "${product.name}" نفدت من الرفوف.`, 'error');
      return;
    }

    const isScaleConnected = devices.find(d => d.type === 'scale')?.status === 'connected';
    const isWeighted = product.category === 'الخضار والفواكه';
    
    let addedQuantity = 1;
    if (forceQuantity !== undefined) {
      addedQuantity = forceQuantity;
    } else if (isWeighted) {
      if (isScaleConnected) {
        if (scaleWeight <= 0) {
          // Weight is 0, let's ask the user to input weight manually or set a weight
          const manualWeightStr = prompt(`الميزان يسجل 0.00 كجم. يرجى إدخال وزن "${product.name}" بالكيلو يدوياً:`, "1.00");
          if (!manualWeightStr) return;
          const w = parseFloat(manualWeightStr);
          if (isNaN(w) || w <= 0) {
            addToast('الوزن المدخل غير صحيح!', 'error');
            return;
          }
          addedQuantity = w;
        } else {
          addedQuantity = scaleWeight;
          addToast(`تم رصد وزن "${product.name}" تلقائياً من الميزان الإلكتروني: ${scaleWeight.toFixed(3)} كجم`, 'success');
        }
      } else {
        // Scale disconnected, ask for manual weight input
        const manualWeightStr = prompt(`الميزان الإلكتروني غير متصل. الرجاء إدخال وزن "${product.name}" يدوياً بالكيلو:`, "1.00");
        if (!manualWeightStr) return;
        const w = parseFloat(manualWeightStr);
        if (isNaN(w) || w <= 0) {
          addToast('الوزن المدخل غير صحيح!', 'error');
          return;
        }
        addedQuantity = w;
      }
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // For weighted items, add to existing weight
        const newQty = existing.quantity + addedQuantity;
        if (newQty > product.stock) {
          playErrorBuzz();
          addToast(`عذراً، المخزون المتوفر هو ${product.stock} حبة/كجم فقط.`, 'warning');
          return prev;
        }
        playCashierBeep();
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: parseFloat(newQty.toFixed(3)) }
            : item
        );
      }
      playCashierBeep();
      return [...prev, { product, quantity: parseFloat(addedQuantity.toFixed(3)) }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('تمت إزالة السلعة من الفاتورة الحالية.', 'info');
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) {
            return item; // Require explicit delete button
          }
          if (newQty > item.product.stock) {
            playErrorBuzz();
            addToast(`عذراً، الحد الأقصى المتوفر بالمخزون هو ${item.product.stock} حبة.`, 'warning');
            return item;
          }
          playCashierBeep();
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // --- Barcode Input Scan Handler ---
  const handleBarcodeSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = products.find((p) => p.barcode === barcodeInput.trim());
    if (matchedProduct) {
      handleAddToCart(matchedProduct);
      addToast(`تم مسح وإضافة: "${matchedProduct.name}"`, 'success');
    } else {
      playErrorBuzz();
      addToast(`الباركود #${barcodeInput} غير مسجل بالمنظومة!`, 'error');
    }
    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  };

  // Camera scan success handler
  const handleCameraScanSuccess = (decodedBarcode: string) => {
    const matchedProduct = products.find((p) => p.barcode === decodedBarcode);
    if (matchedProduct) {
      handleAddToCart(matchedProduct);
      addToast(`تم مسح الباركود بنجاح: "${matchedProduct.name}"`, 'success');
    } else {
      playErrorBuzz();
      addToast(`تم مسح باركود غير مسجل #${decodedBarcode}. يمكنك إضافته من إدارة السلع.`, 'warning');
    }
    barcodeInputRef.current?.focus();
  };

  // --- Custom Quick Item Creator ---
  // Lets cashiers check out general or custom items that aren't pre-loaded on the system (e.g. general grocery of 5 Riyals)
  const handleAddQuickCustomItem = () => {
    const priceStr = prompt('الرجاء إدخال سعر السلعة العامة بالريال السعودي:');
    if (!priceStr) return;
    const itemPrice = parseFloat(priceStr);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      addToast('سعر السلعة المدخل غير صحيح!', 'error');
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const customProduct: Product = {
      id: `custom-${Date.now()}-${randomSuffix}`,
      name: 'سلعة عامة (يدوي)',
      price: itemPrice,
      costPrice: itemPrice * 0.75, // fallback cost
      barcode: '99999999',
      category: 'أخرى',
      stock: 9999, // infinite virtual stock
    };

    handleAddToCart(customProduct);
    addToast('تمت إضافة سلعة عامة للفاتورة.', 'success');
  };

  // --- Financial Calculations ---
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalWithDiscount = Math.max(0, subtotal - discount);
  const vatAmount = totalWithDiscount * storeVatRate / (100 + storeVatRate); // Dynamic VAT included in retail price

  const changeReturnAmount = typeof cashReceived === 'number' ? Math.max(0, cashReceived - totalWithDiscount) : 0;

  // --- Checkout Execution ---
  const handleInitiateCheckout = () => {
    if (cart.length === 0) {
      addToast('الفاتورة فارغة! أضف بعض المنتجات للبيع أولاً.', 'warning');
      return;
    }

    if (selectedPaymentMethod === 'cash') {
      // For cash payment, require typing the received cash amount or double checking
      if (cashReceived === '' || cashReceived < totalWithDiscount) {
        addToast('يرجى إدخال مبلغ النقد المستلم بشكل صحيح لتأكيد البيع.', 'warning');
        return;
      }
      // Instantly succeed cash transactions
      completeSale();
    } else {
      // Check if physical card terminal is connected
      const terminalDev = devices.find(d => d.type === 'terminal');
      if (terminalDev?.status !== 'connected') {
        playErrorBuzz();
        addToast('عذراً، جهاز الدفع مدى (نقاط البيع) مفصول أو غير متصل بالشبكة الحالية! يرجى توصيله من لوحة الأجهزة لإتمام الدفع بالبطاقة.', 'error');
        return;
      }
      // Launch Interactive POS payment terminal simulator for card/nfc payments
      setIsTerminalOpen(true);
    }
  };

  const completeSale = (posApprovalCode?: string) => {
    // Check if printer is connected
    const printerDev = devices.find(d => d.type === 'printer');
    if (printerDev?.status !== 'connected') {
      addToast('تنبيه: طابعة الفواتير الحرارية مفصولة! تم حفظ الفاتورة برمجياً بدون طباعة تلقائية.', 'warning');
    }

    // Generate ZATCA / POS complaint invoice number e.g., INV-2026-10001
    const invoiceSeq = orders.length + 1011;
    const today = new Date();
    const invoiceNum = `INV-${today.getFullYear()}-${invoiceSeq}`;

    const orderRandomSuffix = Math.random().toString(36).substring(2, 9);
    const newOrder: Order = {
      id: `order-${Date.now()}-${orderRandomSuffix}`,
      invoiceNumber: invoiceNum,
      items: [...cart],
      subtotal: subtotal,
      vat: vatAmount,
      discount: discount,
      total: totalWithDiscount,
      paymentMethod: selectedPaymentMethod,
      timestamp: Date.now(),
      receivedAmount: selectedPaymentMethod === 'cash' ? Number(cashReceived) : totalWithDiscount,
      changeAmount: selectedPaymentMethod === 'cash' ? changeReturnAmount : 0
    };

    // Deduct inventory stock levels
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.quantity)
          };
        }
        return p;
      });
    });

    // Save order
    setOrders(prev => [newOrder, ...prev]);
    
    // Close modals
    setIsTerminalOpen(false);

    // Open Thermal Invoice print preview immediately
    setActiveReceiptOrder(newOrder);

    // Reset shopping cart state
    setCart([]);
    setDiscount(0);
    setCashReceived('');

    // Trigger gorgeous celebration!
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 }
    });

    addToast(`تم البيع بنجاح! رقم الفاتورة ${invoiceNum}`, 'success');
  };

  // --- Product Management callbacks ---
  const handleAddProductToInventory = (newProd: Omit<Product, 'id'>) => {
    const activeComp = companies.find(c => c.id === currentCompanyId);
    const limit = activeComp ? activeComp.maxProductsLimit : 9999;
    if (products.length >= limit) {
      addToast(`خطأ في باقة الاشتراك ⚠️ لقد بلغت الحد الأقصى المسموح به (${limit} منتج) لباقة "${getPlanNameArabic(activeComp?.subscriptionPlan)}" لشركة "${activeComp?.name}". يرجى ترقية الباقة لزيادة الحد.`, 'error');
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fresh: Product = {
      id: `prod-${Date.now()}-${randomSuffix}`,
      ...newProd
    };
    setProducts(prev => [fresh, ...prev]);
    addToast(`تم تسجيل السلعة "${fresh.name}" بنجاح في المخزن!`, 'success');
  };

  const handleEditProductInInventory = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    addToast(`تم حفظ تعديلات السلعة "${updatedProd.name}".`, 'success');
  };

  const handleBulkImportProducts = (itemsToAdd: Omit<Product, 'id'>[], itemsToEdit: Product[]) => {
    const activeComp = companies.find(c => c.id === currentCompanyId);
    const limit = activeComp ? activeComp.maxProductsLimit : 9999;
    const currentProductCount = products.length;
    const projectedCount = currentProductCount - itemsToEdit.length + itemsToAdd.length;

    let finalItemsToAdd = [...itemsToAdd];
    if (projectedCount > limit) {
      const allowedAddCount = Math.max(0, limit - currentProductCount + itemsToEdit.length);
      addToast(`تنبيه باقة الاشتراك ⚠️ تم تجاوز الحد الأقصى للمنتجات (${limit} منتج) لهذه الشركة. تم استيراد وتحديث السلع القديمة، ولكن تم قبول ${allowedAddCount} منتج جديد فقط. يرجى ترقية الاشتراك للاستيراد الكامل.`, 'warning');
      finalItemsToAdd = itemsToAdd.slice(0, allowedAddCount);
    }

    setProducts(prev => {
      const editMap = new Map<string, Product>();
      itemsToEdit.forEach(item => editMap.set(item.id, item));

      const updatedList = prev.map(p => editMap.has(p.id) ? editMap.get(p.id)! : p);

      const randomSuffix = () => Math.random().toString(36).substring(2, 9);
      const newItemsWithIds: Product[] = finalItemsToAdd.map((item, index) => ({
        id: `prod-${Date.now() + index}-${randomSuffix()}`,
        ...item
      }));

      return [...newItemsWithIds, ...updatedList];
    });

    if (finalItemsToAdd.length > 0 || itemsToEdit.length > 0) {
      addToast(`نجحت العملية! تم استيراد ${finalItemsToAdd.length} منتج جديد وتحديث ${itemsToEdit.length} منتج سابق بنجاح.`, 'success');
    }
  };

  const handleDeleteProductFromInventory = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast('تم حذف السلعة نهائياً من الرفوف.', 'info');
  };

  // --- Company Management Callbacks ---
  const handleSwitchCompany = (id: string) => {
    setCurrentCompanyId(id);
  };

  const handleAddCompany = (newComp: Omit<Company, 'id'>) => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fresh: Company = {
      id: `comp-${Date.now()}-${randomSuffix}`,
      ...newComp
    };
    setCompanies(prev => [...prev, fresh]);
  };

  const handleUpdateCompanyPlan = (companyId: string, plan: 'free' | 'basic' | 'premium' | 'enterprise', limit: number) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          subscriptionPlan: plan,
          maxProductsLimit: limit,
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Prolong 30 days
        };
      }
      return c;
    }));
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    localStorage.removeItem(`pos_products_${id}`);
    localStorage.removeItem(`pos_orders_${id}`);
  };

  // --- Order History Refund handler ---
  const handleRefundOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Return items stock back to shelves
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const refundedItem = targetOrder.items.find(item => item.product.id === p.id);
        if (refundedItem) {
          return {
            ...p,
            stock: p.stock + refundedItem.quantity
          };
        }
        return p;
      });
    });

    // Remove order from history
    setOrders(prev => prev.filter(o => o.id !== orderId));
    addToast(`تم إرجاع الفاتورة رقم ${targetOrder.invoiceNumber} بنجاح وإعادة البضائع للمخزون.`, 'success');
  };

  // Helper to render category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'الكل':
        return <Layers className="w-3.5 h-3.5" />;
      case 'الألبان والأجبان':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'المشروبات':
        return <CupSoda className="w-3.5 h-3.5 text-blue-500" />;
      case 'المخبوزات':
        return <Cookie className="w-3.5 h-3.5 text-orange-400" />;
      case 'المعلبات':
        return <Package className="w-3.5 h-3.5 text-indigo-400" />;
      case 'الخضار والفواكه':
        return <Apple className="w-3.5 h-3.5 text-rose-500" />;
      case 'السكاكر والحلويات':
        return <Gift className="w-3.5 h-3.5 text-pink-500" />;
      case 'مواد التنظيف':
        return <Sparkle className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Package className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Filter Catalog Products to show in cashier grid
  const filteredCatalog = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesLowStock = !showOnlyLowStock || p.stock < 5;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col select-none" style={{ direction: isRtl ? 'rtl' : 'ltr' }} id="pos-root">
      
      {/* 1. Main Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 print:hidden shadow-sm">
        {/* Title and stats summary */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-teal-50 to-teal-100/50 border border-teal-200/50 p-1.5 rounded-xl shadow-md shadow-teal-500/5">
              <QaydLogo size={38} showText={false} animated={true} />
            </div>
            <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
              <h1 className="text-lg font-black text-slate-800 flex items-center gap-1.5 flex-wrap">
                <span>{t('app_title', currentLang)}</span>
                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-extrabold">
                  {t('pos_smart_badge', currentLang)}
                </span>
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{t('app_subtitle', currentLang)}</p>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Company Switcher Widget */}
          <button
            onClick={() => setIsCompanyManagerOpen(true)}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 transition-all text-right cursor-pointer group shadow-sm active:scale-95"
            id="company-switcher-trigger"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-indigo-600 block leading-none mb-0.5">
                {currentLang === 'ar' ? 'المؤسسة والاشتراك النشط 🏢' : 'Active Company & Subscription 🏢'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-800">{storeName}</span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${getPlanBadgeStyle(companies.find(c => c.id === currentCompanyId)?.subscriptionPlan)}`}>
                  {getPlanNameArabic(companies.find(c => c.id === currentCompanyId)?.subscriptionPlan).split(' (')[0]}
                </span>
                {supabaseConfigured && isSupabaseSyncEnabled && (
                  <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full" title={supabaseSyncStatus === 'synced' ? 'مزامنة سحابية نشطة' : 'جاري المزامنة...'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${supabaseSyncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-[8px] font-black text-slate-500">سحابي</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* QAYD Integrated System Dashboard Trigger Button */}
          <button
            onClick={() => setIsQaydDashboardOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-lg shadow-teal-600/25 border border-teal-500/30 animate-pulse"
            id="btn-open-qayd-dashboard"
            style={{ animationDuration: '2.5s' }}
          >
            <QaydLogo size={18} showText={false} animated={false} />
            <span>منظومة قيد (QAYD) المتكاملة 👑</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl px-3 py-2 shadow-sm transition-all">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Language / لغة:</span>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
              style={{ direction: 'ltr' }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-slate-800">
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Stats Summary today */}
          <div className={`hidden lg:flex flex-col ${isRtl ? 'text-right pr-4 border-r' : 'text-left pl-4 border-l'} border-slate-200`}>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {currentLang === 'ar' ? 'إيراد اليوم' : 'Daily Sale'}
            </span>
            <span className="font-mono text-xs font-bold text-emerald-600">
              {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} {t('sar_currency', currentLang)}
            </span>
          </div>

          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-100 to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm animate-pulse"
            id="btn-offline-download"
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>{t('btn_offline', currentLang)}</span>
          </button>

          <button
            onClick={() => setIsProductManagerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            id="btn-manage-products"
          >
            <Package className="w-4 h-4 text-blue-500" />
            <span>{t('btn_manage_products', currentLang)}</span>
          </button>

          <button
            onClick={() => {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.connect(audioCtx.destination);
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.05);
              } catch (e) {}
              setIsDeviceManagerOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            id="btn-open-device-manager"
          >
            <Cpu className={`w-4 h-4 ${devices.filter(d => d.status === 'connected').length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>{t('btn_devices', currentLang)}</span>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${devices.filter(d => d.status === 'connected').length > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${devices.filter(d => d.status === 'connected').length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
          </button>

          <button
            onClick={() => setIsCashierSettingsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            id="btn-cashier-settings"
          >
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>{currentLang === 'ar' ? 'إعدادات الكاشير' : 'Cashier Settings'}</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            id="btn-sales-history"
          >
            <History className="w-4 h-4 text-emerald-500" />
            <span>{t('btn_order_history', currentLang)}</span>
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
            id="btn-open-camera-scanner"
          >
            <Camera className="w-4 h-4" />
            <span>{currentLang === 'ar' ? 'مسح بالكاميرا' : 'Camera Scan'}</span>
          </button>
        </div>
      </header>

      {/* 2. Primary Layout Workspace */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 print:p-0">
        
        {/* LEFT PANEL: Shopping Cart & Checkout Dashboard (xl:col-span-5) */}
        <section className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden p-5 print:hidden">
          
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span>الفاتورة الحالية</span>
            </h2>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleAddQuickCustomItem}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-medium rounded-lg text-[10px] transition-colors border border-slate-200 cursor-pointer"
              >
                + سلعة يدوية عامة
              </button>
              {cart.length > 0 && (
                showClearCartConfirm ? (
                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-lg p-0.5 animate-fade-in">
                    <span className="text-[9px] font-bold text-rose-600 px-1">مسح الفاتورة؟</span>
                    <button
                      onClick={() => {
                        setCart([]);
                        setShowClearCartConfirm(false);
                      }}
                      className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold rounded transition-colors cursor-pointer"
                    >
                      نعم
                    </button>
                    <button
                      onClick={() => setShowClearCartConfirm(false)}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-bold rounded transition-colors cursor-pointer"
                    >
                      لا
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearCartConfirm(true)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] transition-colors border border-rose-100 cursor-pointer"
                  >
                    مسح الكل
                  </button>
                )
              )}
            </div>
          </div>

          {/* Barcode Physical Scanner Simulator Input Box */}
          <div className="py-3 shrink-0">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <Barcode className="w-4 h-4 text-blue-500 absolute right-3.5 top-3" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="امسح الرمز بالجهاز أو اكتب الباركود واضغط إنتر..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pr-10 pl-16 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none transition-all placeholder:text-slate-400 font-mono font-bold text-slate-800"
              />
              <button
                type="submit"
                className="absolute left-2 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                إدخال
              </button>
            </form>
          </div>

          {/* Cart Items List Container */}
          <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mb-3 text-slate-300 animate-bounce" style={{ animationDuration: '3s' }} />
                <p className="text-xs font-semibold text-slate-500">سلة المبيعات فارغة</p>
                <p className="text-[10px] text-slate-400 mt-1">ابدأ بمسح باركود المنتجات أو النقر على السلع من القائمة.</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                    layout
                    className="p-3 bg-slate-50 hover:bg-slate-100/85 rounded-xl border border-slate-100 flex justify-between items-center gap-3 group transition-colors"
                    id={`cart-item-${item.product.id}`}
                  >
                    {/* Item Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-800 leading-snug truncate">
                        {item.product.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono text-blue-600 font-semibold">{item.product.price.toFixed(2)} ر.س</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[9px] bg-white border border-slate-100 text-slate-400 px-1 rounded">#{item.product.barcode}</span>
                      </div>
                    </div>

                    {/* Quantity Control & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden font-mono">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="p-1 px-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs"
                          title="تقليل الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="p-1 px-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs"
                          title="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-left min-w-[70px] font-mono font-bold text-xs text-slate-800">
                        {(item.product.price * item.quantity).toFixed(2)} ر.س
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="إزالة من الفاتورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Checkout Controls Area */}
          <div className="mt-auto pt-4 border-t border-slate-100 shrink-0 space-y-4">
            
            {/* Discount and Cash input */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Discount Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  <span>خصم الفاتورة (SAR)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500/35 text-xs font-bold font-mono text-slate-800 rounded-lg focus:outline-none"
                  />
                  <span className="absolute left-2.5 top-2 text-[9px] font-bold text-slate-400">ر.س</span>
                </div>
              </div>

              {/* Cash Received (Only visible when cash payment method chosen) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>النقد المستلم (كاش)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="مبلغ الكاش المستلم..."
                    value={cashReceived}
                    disabled={selectedPaymentMethod !== 'cash'}
                    onChange={(e) => setCashReceived(e.target.value !== '' ? parseFloat(e.target.value) : '')}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500/35 disabled:opacity-40 text-xs font-bold font-mono text-slate-800 rounded-lg focus:outline-none"
                  />
                  <span className="absolute left-2.5 top-2 text-[9px] font-bold text-slate-400">ر.س</span>
                </div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500">وسيلة الدفع المفضلة</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'كاش', icon: <Coins className="w-4.5 h-4.5 text-amber-500" /> },
                  { id: 'mada', label: 'مدى', icon: <span className="text-[9px] font-extrabold italic bg-blue-50 text-blue-800 px-1 rounded border border-blue-100">mada</span> },
                  { id: 'apple_pay', label: 'Apple Pay', icon: <span className="text-[10px] font-bold text-slate-800"> Pay</span> },
                  { id: 'visa', label: 'فيزا', icon: <span className="text-[8px] font-extrabold italic text-indigo-600">VISA</span> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedPaymentMethod(item.id as PaymentMethod);
                      // Clear cash inputs if switching to card to avoid warnings
                      if (item.id !== 'cash') setCashReceived('');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      selectedPaymentMethod === item.id
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span className="mt-1 text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Math summary block */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-medium">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-xs text-rose-600">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono font-bold">-{discount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>ضريبة القيمة المضافة (مشمولة {storeVatRate}%):</span>
                <span className="font-mono">{vatAmount.toFixed(2)} ر.س</span>
              </div>
              {selectedPaymentMethod === 'cash' && cashReceived !== '' && (
                <div className="flex justify-between items-center text-xs text-emerald-600 pt-1 border-t border-slate-200">
                  <span>المبلغ المسترجع للعميل:</span>
                  <span className="font-mono font-bold text-sm">{changeReturnAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>الإجمالي الكلي للبيع:</span>
                <span className="font-mono text-base text-blue-600">{totalWithDiscount.toFixed(2)} ر.س</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleInitiateCheckout}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              id="btn-complete-sale"
            >
              <Check className="w-5 h-5" />
              <span>إتمام وتأكيد البيع (طباعة الفاتورة)</span>
            </button>
          </div>
        </section>

        {/* RIGHT PANEL: Product Catalog Directory (xl:col-span-7) */}
        <section className="xl:col-span-7 flex flex-col overflow-hidden p-5 print:hidden">
          
          {/* Catalog search and category filters */}
          <div className="space-y-4 shrink-0">
            
            {/* Search Input & Low Stock Toggle Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ابحث عن سلعة باسمها أو بالباركود في الرفوف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
                />
              </div>

              {/* Low Stock View Toggle Button */}
              <button
                onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  showOnlyLowStock
                    ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>إظهار النواقص فقط {products.filter(p => p.stock < 5).length > 0 && `(${products.filter(p => p.stock < 5).length})`}</span>
              </button>
            </div>

            {/* Category tabs carousel */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Low stock warning dashboard block */}
          {products.filter(p => p.stock < 5).length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mt-4 shrink-0 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                  </span>
                  <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span>تنبيه نواقص المخزون (تحذير كاشير)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                      {products.filter(p => p.stock < 5).length} سلع منخفضة
                    </span>
                  </h3>
                </div>
                <span className="text-[10px] text-amber-700/80">المخزون أقل من 5 وحدات</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-200">
                {products.filter(p => p.stock < 5).map((p) => (
                  <div 
                    key={p.id}
                    className="bg-white p-2.5 rounded-xl border border-amber-100 min-w-[160px] max-w-[200px] flex flex-col justify-between shadow-sm hover:border-amber-400 transition-colors"
                  >
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold text-slate-800 truncate" title={p.name}>
                        {p.name}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-mono text-[9px] text-slate-400">#{p.barcode.substring(p.barcode.length - 4)}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          p.stock === 0 
                            ? 'bg-rose-50 text-rose-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.stock === 0 ? 'نفد' : `متبقي: ${p.stock}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-50 flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-slate-600">
                        {p.price.toFixed(2)} ر.س
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick restock function (+10 items)
                          setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: prod.stock + 10 } : prod));
                          addToast(`تم تزويد مخزون "${p.name}" بـ 10 حبات إضافية.`, 'success');
                        }}
                        className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                      >
                        تزويد +10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products grid area */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                <Package className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">لا تتوفر أي سلع</p>
                <p className="text-xs text-slate-400 mt-1">امسح البحث أو فلتر النواقص لتظهر سلع البقالة المتاحة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredCatalog.map((prod) => {
                  const inCartQty = cart.find(item => item.product.id === prod.id)?.quantity || 0;
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = prod.stock <= 5;
                  const isUnavailable = !!prod.isUnavailable;

                  return (
                    <motion.div
                      key={prod.id}
                      whileHover={{ scale: isOutOfStock || isUnavailable ? 1 : 1.015 }}
                      whileTap={{ scale: isOutOfStock || isUnavailable ? 1 : 0.985 }}
                      onClick={() => handleAddToCart(prod)}
                      className={`p-3 rounded-xl border text-right relative flex flex-col justify-between min-h-[160px] transition-all shadow-sm ${
                        isUnavailable
                          ? 'bg-rose-50/20 border-rose-200/50 opacity-70 text-slate-400 cursor-not-allowed'
                          : isOutOfStock 
                            ? 'bg-slate-50 border-slate-200 opacity-60 text-slate-400 cursor-not-allowed' 
                            : inCartQty > 0
                              ? 'bg-blue-50/40 border-blue-500 text-blue-900 shadow-blue-500/5 cursor-pointer'
                              : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md text-slate-800 cursor-pointer'
                      }`}
                      id={`catalog-item-${prod.id}`}
                    >
                      {/* Active count badge in cart */}
                      {inCartQty > 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm shadow-blue-600/20">
                          {inCartQty}
                        </div>
                      )}

                      {/* Product Image section if exists */}
                      {prod.image && (
                        <div className="w-full h-20 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center mb-2 p-1 relative shrink-0">
                          <img 
                            src={prod.image} 
                            alt={translateProduct(prod.name, currentLang)} 
                            className={`h-full object-contain ${isUnavailable || isOutOfStock ? 'grayscale opacity-75' : ''}`}
                            referrerPolicy="no-referrer" 
                            id={`prod-image-${prod.id}`}
                          />
                          {isUnavailable && (
                            <div className="absolute inset-0 bg-rose-500/5 flex items-center justify-center">
                              <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {currentLang === 'ar' ? 'غير متوفر ❌' : 'Unavailable ❌'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Header product description */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[8px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                            {translateCategory(prod.category, currentLang)}
                          </span>
                          {!prod.image && isUnavailable && (
                            <span className="text-[8px] bg-rose-50 text-rose-700 border border-rose-100 font-extrabold px-1.5 py-0.5 rounded-full">
                              {currentLang === 'ar' ? 'غير متوفر' : 'Unavailable'}
                            </span>
                          )}
                        </div>
                        <h4 className={`font-bold text-[11px] leading-snug pt-1 line-clamp-2 ${isUnavailable ? 'text-slate-400 line-through font-medium' : 'text-slate-800'}`}>
                          {translateProduct(prod.name, currentLang)}
                        </h4>
                      </div>

                      {/* Bottom row: price, barcode, stock status */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between shrink-0">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-slate-400">#{prod.barcode.substring(prod.barcode.length - 4)}</span>
                          <span className={`text-[9px] font-bold ${
                            isUnavailable
                              ? 'text-rose-500 font-extrabold'
                              : isOutOfStock 
                                ? 'text-rose-600' 
                                : isLowStock 
                                  ? 'text-amber-500' 
                                  : 'text-emerald-600'
                          }`}>
                            {isUnavailable 
                              ? (currentLang === 'ar' ? 'غير متاح' : 'Unavailable') 
                              : isOutOfStock 
                                ? (currentLang === 'ar' ? 'نفد' : 'Sold out') 
                                : (currentLang === 'ar' ? `مخزن: ${prod.stock}` : `Stock: ${prod.stock}`)}
                          </span>
                        </div>
                        <div className={`text-left font-mono font-bold text-xs ${isUnavailable ? 'text-slate-400' : 'text-blue-600'}`}>
                          {prod.price.toFixed(2)} <span className="text-[9px] font-sans text-slate-400">ر.س</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 2.5. Real-time Hardware & Session Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 shrink-0 print:hidden shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>المستخدم الحالي: <strong className="text-slate-700">أحمد المحاسب</strong></span>
          </div>
          <span className="text-slate-300">|</span>
          <div>الجلسة: <strong className="text-slate-700 font-mono">#4492</strong></div>
          <span className="text-slate-300">|</span>
          <div>النظام: <strong className="text-slate-700 font-mono">v3.2.0 (محدث)</strong></div>
        </div>

        {/* Real-time Hardware Indicators */}
        <div className="flex items-center flex-wrap gap-4 justify-center sm:justify-end">
          {/* Real-time Scale Weight indicator */}
          <button 
            onClick={() => setIsDeviceManagerOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 rounded-lg cursor-pointer transition-colors font-sans text-xs"
          >
            <Scale className={`w-3.5 h-3.5 ${devices.find(d => d.type === 'scale')?.status === 'connected' ? 'text-blue-500' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold text-slate-600">
              {devices.find(d => d.type === 'scale')?.status === 'connected' 
                ? `الميزان: ${scaleWeight.toFixed(3)} كجم` 
                : 'الميزان: مفصول 🔴'}
            </span>
          </button>

          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            {devices.map((dev) => {
              const isConn = dev.status === 'connected';
              return (
                <button 
                  key={dev.id} 
                  className="flex items-center gap-1.5 group cursor-pointer border-none bg-transparent p-0 text-xs text-slate-500 font-medium"
                  title={`${dev.arabicName}: ${isConn ? 'متصل' : 'مفصول'}`}
                  onClick={() => setIsDeviceManagerOpen(true)}
                >
                  <span className="w-1.5 h-1.5 rounded-full relative flex">
                    {isConn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConn ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-600 transition-colors">{dev.arabicName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {/* 3. MODALS LAYER CONTAINER */}
      
      {/* A. TOAST MANAGER */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* B. ACTIVE PRINT RECEIPT OVERLAY */}
      {activeReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 print:p-0">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[90vh] print:h-auto overflow-hidden shadow-2xl flex flex-col">
            <Receipt
              order={activeReceiptOrder}
              onClose={() => setActiveReceiptOrder(null)}
              showActions={true}
              lang={currentLang}
              storeName={storeName}
              storeVat={storeVat}
              welcomeMsg={welcomeMsg}
              storeCr={storeCr}
              vatRate={storeVatRate}
            />
          </div>
        </div>
      )}

      {/* C. CAMERA BARCODE SCANNER MODAL */}
      {isScannerOpen && (
        <CameraScanner
          onScanSuccess={handleCameraScanSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* D. INTERACTIVE POS E-PAYMENT TERMINAL SIMULATOR */}
      {isTerminalOpen && (
        <PaymentTerminal
          total={totalWithDiscount}
          paymentMethod={selectedPaymentMethod}
          onPaymentSuccess={completeSale}
          onPaymentCancel={() => {
            setIsTerminalOpen(false);
            addToast('تم إلغاء عملية الدفع بالبطاقة من العميل.', 'warning');
          }}
        />
      )}

      {/* E. PRODUCT MANAGER INVENTORY DIALOG */}
      {isProductManagerOpen && (
        <ProductManager
          products={products}
          onAddProduct={handleAddProductToInventory}
          onEditProduct={handleEditProductInInventory}
          onDeleteProduct={handleDeleteProductFromInventory}
          onClose={() => setIsProductManagerOpen(false)}
          addToast={addToast}
          onBulkImport={handleBulkImportProducts}
        />
      )}

      {/* F. ORDER HISTORY AND ANALYTICS LOGS DIALOG */}
      {isHistoryOpen && (
        <OrderHistory
          orders={orders}
          onRefundOrder={handleRefundOrder}
          onSelectOrderForPrint={(ord) => {
            setIsHistoryOpen(false);
            setActiveReceiptOrder(ord);
          }}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* G. HARDWARE DEVICES MANAGER AND SIMULATION DIALOG */}
      {isDeviceManagerOpen && (
        <DeviceManager
          devices={devices}
          scaleWeight={scaleWeight}
          setScaleWeight={setScaleWeight}
          onUpdateDevices={setDevices}
          onClose={() => setIsDeviceManagerOpen(false)}
          addToast={addToast}
          wedgeEnabled={wedgeEnabled}
          setWedgeEnabled={setWedgeEnabled}
          wedgePrefix={wedgePrefix}
          setWedgePrefix={setWedgePrefix}
          wedgeSuffix={wedgeSuffix}
          setWedgeSuffix={setWedgeSuffix}
          storeName={storeName}
          setStoreName={setStoreName}
          storeVat={storeVat}
          setStoreVat={setStoreVat}
          storeCr={storeCr}
          setStoreCr={setStoreCr}
          storeVatRate={storeVatRate}
          setStoreVatRate={setStoreVatRate}
          welcomeMsg={welcomeMsg}
          setWelcomeMsg={setWelcomeMsg}
        />
      )}

      {/* H. MULTI-COMPANY & SUBSCRIPTION MANAGER */}
      {isCompanyManagerOpen && (
        <CompanyManager
          companies={companies}
          currentCompanyId={currentCompanyId}
          onSwitchCompany={handleSwitchCompany}
          onAddCompany={handleAddCompany}
          onUpdateCompanyPlan={handleUpdateCompanyPlan}
          onDeleteCompany={handleDeleteCompany}
          onClose={() => setIsCompanyManagerOpen(false)}
          currentProductCount={products.length}
          addToast={addToast}
          lang={currentLang === 'ar' ? 'ar' : 'en'}
          supabaseConfigured={supabaseConfigured}
          supabaseSyncStatus={supabaseSyncStatus}
          supabaseErrorType={supabaseErrorType}
          isSupabaseSyncEnabled={isSupabaseSyncEnabled}
          onToggleSupabaseSync={(val) => setIsSupabaseSyncEnabled(val)}
          onManualSync={() => {
            syncAllWithSupabase(companies, products, orders, currentCompanyId);
            addToast('جاري بدء مزامنة البيانات يدوياً مع Supabase سحابياً...', 'info');
          }}
        />
      )}

      {/* Cashier Settings Modal */}
      {isCashierSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-right flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setIsCashierSettingsOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>إعدادات الكاشير والمؤسسة ⚙️</span>
              </h3>
            </div>

            {/* Banner info */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-indigo-950 block text-right">تحديث معلومات الفاتورة والمحل</span>
                <p className="text-[11px] text-slate-600 leading-relaxed text-right">
                  من هنا يمكنك تعديل البيانات الأساسية التي تظهر للزبائن على الفاتورة الحرارية المطبوعة، مثل الاسم التجاري، السجل التجاري، الرقم الضريبي، ونسبة الضريبة المضافة.
                </p>
              </div>
            </div>

            {/* Inputs Form */}
            <div className="space-y-4">
              {/* Store Name Input */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 block">اسم المحل التجاري / الكاشير:</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                  placeholder="مثال: بقالة البركة والخيرات"
                />
                <span className="text-[10px] text-slate-400 block">يظهر كعنوان رئيسي في أعلى الفاتورة وعند التصدير.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VAT Number Input */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">الرقم الضريبي للمحل (VAT No.):</label>
                  <input
                    type="text"
                    value={storeVat}
                    onChange={(e) => setStoreVat(e.target.value)}
                    className="w-full font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                    placeholder="مثال: 300055443300003"
                  />
                  <span className="text-[10px] text-slate-400 block">رقم التسجيل الضريبي المعتمد (15 خانة).</span>
                </div>

                {/* CR Number Input */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">رقم السجل التجاري (CR No.):</label>
                  <input
                    type="text"
                    value={storeCr}
                    onChange={(e) => setStoreCr(e.target.value)}
                    className="w-full font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                    placeholder="مثال: 1010000000"
                  />
                  <span className="text-[10px] text-slate-400 block">رقم السجل التجاري المعتمد للمؤسسة.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VAT Rate Input */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">نسبة ضريبة القيمة المضافة (%):</label>
                  <div className="relative">
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
                      className="w-full font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm text-left pl-8"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">النسبة المعتمدة لاحتساب ضريبة المبيعات.</span>
                </div>

                {/* Welcoming Footer Message Input */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">الرسالة الترحيبية (ذيل الفاتورة):</label>
                  <input
                    type="text"
                    value={welcomeMsg}
                    onChange={(e) => setWelcomeMsg(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-sm"
                    placeholder="مثال: نشكركم لتسوقكم معنا!"
                  />
                  <span className="text-[10px] text-slate-400 block">رسالة شكر ترحيبية تظهر في أسفل الفاتورة الحرارية.</span>
                </div>
              </div>
            </div>

            {/* Save/Close Button */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={() => {
                  setIsCashierSettingsOpen(false);
                  addToast('تم حفظ إعدادات الكاشير والمحل بنجاح!', 'success');
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 text-center flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التعديلات وإغلاق</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* H. OFFLINE & DOWNLOAD TO PC DIALOG */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-right flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setIsOfflineModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>التحميل على الكمبيوتر والعمل دون إنترنت 💻</span>
              </h3>
            </div>

            {/* Overview / Banner */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-9 h-9 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-indigo-950 block text-right">نظام كاشير آمن، مستقل، ومستعد أوفلاين كلياً!</span>
                <p className="text-xs text-slate-600 leading-relaxed text-right">
                  تم تصميم تطبيق بقالة البركة والخيرات ليعمل بشكل مستقل تماماً داخل المتصفح أو كبرنامج مثبت على حاسوبك الشخصي. جميع بيانات المخزون والمبيعات والفواتير والربحية محفوظة بشكل آمن ومحلي، مما يتيح لك الاستمرار بالعمل والبيع والطباعة حتى في حال انقطاع شبكة الإنترنت كلياً!
                </p>
              </div>
            </div>

            {/* Installation Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method 1: PWA */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">الطريقة الأولى: التثبيت الفوري (PWA)</span>
                  <h4 className="text-sm font-bold text-slate-800">تثبيت كبرنامج مستقل على سطح المكتب</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    يعتمد كاشير البركة تقنية الـ PWA لتثبيت النظام مباشرة كأيقونة على سطح المكتب للكمبيوتر دون الحاجة لأي ملفات تثبيت خارجية معقدة.
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 pr-4 list-disc font-medium text-right">
                    <li>متوافق مع متصفحات Chrome و Edge و Safari.</li>
                    <li>يمنحك تشغيل بملء الشاشة وإقلاعاً فورياً.</li>
                    <li>سرعة فائقة في معالجة العمليات وحفظ البيانات.</li>
                  </ul>
                </div>

                {showInstallBtn ? (
                  <button
                    onClick={handleInstallApp}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تثبيت كبرنامج الآن 📥</span>
                  </button>
                ) : (
                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-center">
                    <span className="text-[11px] text-amber-800 font-bold block">💡 كيف تثبت التطبيق يدوياً؟</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      انقر على أيقونة التثبيت <span className="font-bold text-indigo-600 font-sans">(+)</span> أو شاشة الكمبيوتر الصغيرة الموجودة في شريط عنوان المتصفح بالأعلى لتنزيل التطبيق لسطح المكتب.
                    </p>
                  </div>
                )}
              </div>

              {/* Method 2: Offline Capabilities */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">الطريقة الثانية: وضع العمل دون إنترنت</span>
                  <h4 className="text-sm font-bold text-slate-800">بياناتك محفوظة محلياً في جهازك دائماً</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    يستخدم النظام محرّك التخزين المحلي والـ Cache Service Worker لتأمين بيئة عمل أوفلاين بالكامل.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 justify-end text-[11px] text-slate-600 font-medium">
                      <span>حفظ الفواتير والعمليات أوفلاين تلقائياً</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-[11px] text-slate-600 font-medium">
                      <span>إدارة المخزون والتعديل دون إنترنت</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-[11px] text-slate-600 font-medium">
                      <span>طباعة وتصدير الفواتير PDF/TXT محلياً</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>النظام متصل بقاعدة بيانات محلية نشطة</span>
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed text-right">
                    لا تقلق! حتى لو تم قطع كيبل الإنترنت أو انقطع الاتصال بالراوتر، يمكنك البيع والطباعة وإضافة السلع بشكل طبيعي جداً.
                  </p>
                </div>
              </div>
            </div>

            {/* Standalone package instructions */}
            <div className="p-4 border border-indigo-50 bg-indigo-50/10 rounded-2xl space-y-2 text-right">
              <span className="text-xs font-bold text-slate-800 block">📦 هل تفضل تنزيل حزمة مستقلة بالكامل؟</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                إذا كنت ترغب بتشغيل خادم مستقل على الحاسوب وربطه بقارئات باركود حقيقية وطابعات فواتير تجارية مادية، يمكنك استخدام زر تصدير المشروع كملف مضغوط (ZIP) من قائمة الإعدادات الجانبية بـ AI Studio، ثم فك ضغطه وتشغيله محلياً عبر كتابة الأمر <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600">npm run build && npm run dev</code> ليصبح لديك خادم بقالة محلي متكامل ومثبت دائماً بدون إنترنت!
              </p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-start">
              <button
                onClick={() => setIsOfflineModalOpen(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                حسناً، فهمت ذلك
              </button>
            </div>
          </div>
        </div>
      )}
      {isQaydDashboardOpen && (
        <QaydDashboard
          isOpen={isQaydDashboardOpen}
          onClose={() => setIsQaydDashboardOpen(false)}
          companies={companies}
          setCompanies={setCompanies}
          currentCompanyId={currentCompanyId}
          setCurrentCompanyId={setCurrentCompanyId}
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
          devices={devices}
          storeName={storeName}
          setStoreName={setStoreName}
          storeVat={storeVat}
          setStoreVat={setStoreVat}
          storeCr={storeCr}
          setStoreCr={setStoreCr}
          storeVatRate={storeVatRate}
          setStoreVatRate={setStoreVatRate}
          addToast={addToast}
        />
      )}
    </div>
  );
}
