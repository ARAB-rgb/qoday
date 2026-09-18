import { useState } from 'react';
import { 
  History, 
  X, 
  Search, 
  Download, 
  CreditCard, 
  ShoppingBag, 
  TrendingUp, 
  Calendar, 
  RotateCcw, 
  Eye, 
  Wallet,
  Printer,
  Globe,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Order } from '../types';
import { LanguageCode, t, translateProduct, getBilingualText, LANGUAGES } from '../lib/translations';

interface OrderHistoryProps {
  orders: Order[];
  onRefundOrder: (orderId: string) => void;
  onSelectOrderForPrint: (order: Order) => void;
  onClose: () => void;
  lang?: LanguageCode;
  storeName?: string;
  storeVat?: string;
}

export default function OrderHistory({
  orders,
  onRefundOrder,
  onSelectOrderForPrint,
  onClose,
  lang = 'ar',
  storeName = 'مؤسسة قيد التجارية',
  storeVat = '300055443300003'
}: OrderHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refundConfirmOrderId, setRefundConfirmOrderId] = useState<string | null>(null);
  const [showZReportPreview, setShowZReportPreview] = useState(false);

  const isBilingual = lang !== 'ar';
  const isRtl = lang === 'ar' || lang === 'ur';
  const activeLangConfig = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Helper for bilingual labels
  const bLabel = (key: string, arabicFallback: string) => {
    if (!isBilingual) return arabicFallback;
    const translated = t(key, lang);
    return getBilingualText(arabicFallback, translated, lang);
  };

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.invoiceNumber.toLowerCase().includes(term) ||
      order.paymentMethod.toLowerCase().includes(term) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(term))
    );
  });

  // Analytics Metrics
  const totalSales = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalVat = orders.reduce((sum, ord) => sum + ord.vat, 0);
  const netSales = totalSales - totalVat;
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Approximate net profit
  const estimatedProfit = orders.reduce((profit, ord) => {
    const orderCost = ord.items.reduce((cost, item) => {
      const itemCost = item.product.costPrice !== undefined ? item.product.costPrice : (item.product.price * 0.7);
      return cost + (itemCost * item.quantity);
    }, 0);
    const orderNetRevenue = ord.total - ord.vat;
    return profit + (orderNetRevenue - orderCost);
  }, 0);

  // Payment Breakdown
  const paymentBreakdown = {
    cash: { count: 0, total: 0 },
    mada: { count: 0, total: 0 },
    visa: { count: 0, total: 0 },
    apple_pay: { count: 0, total: 0 }
  };

  orders.forEach((ord) => {
    if (paymentBreakdown[ord.paymentMethod]) {
      paymentBreakdown[ord.paymentMethod].count += 1;
      paymentBreakdown[ord.paymentMethod].total += ord.total;
    }
  });

  // Top Selling Products
  const productSalesMap: Record<string, { name: string; quantity: number; totalRevenue: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productSalesMap[item.product.id]) {
        productSalesMap[item.product.id] = {
          name: item.product.name,
          quantity: 0,
          totalRevenue: 0
        };
      }
      productSalesMap[item.product.id].quantity += item.quantity;
      productSalesMap[item.product.id].totalRevenue += item.product.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const formatDate = (epoch: number) => {
    const d = new Date(epoch);
    return d.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (epoch: number) => {
    const d = new Date(epoch);
    return d.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return bLabel('payment_cash', 'نقداً');
      case 'mada': return bLabel('payment_mada', 'مدى');
      case 'visa': return bLabel('payment_visa', 'فيزا');
      case 'apple_pay': return bLabel('payment_apple_pay', 'أبل باي');
      default: return method;
    }
  };

  // Export CSV Handler
  const handleExportSalesCSV = () => {
    if (orders.length === 0) return;

    const headers = isBilingual ? [
      "رقم الفاتورة / Invoice #",
      "تاريخ البيع / Date",
      "وقت البيع / Time",
      "طريقة الدفع / Payment Method",
      "المجموع الفرعي / Subtotal (SAR)",
      "الضريبة / VAT 15% (SAR)",
      "الخصم / Discount (SAR)",
      "الإجمالي الكلي / Grand Total (SAR)",
      "عدد السلع / Items Count"
    ] : [
      "رقم الفاتورة",
      "تاريخ البيع",
      "وقت البيع",
      "طريقة الدفع",
      "المجموع الفرعي (ر.س)",
      "الضريبة 15% (ر.س)",
      "الخصم (ر.س)",
      "الإجمالي الكلي (ر.س)",
      "عدد السلع"
    ];

    const rows = orders.map(ord => [
      `"${ord.invoiceNumber}"`,
      `"${formatDate(ord.timestamp)}"`,
      `"${formatTime(ord.timestamp)}"`,
      `"${getPaymentMethodName(ord.paymentMethod)}"`,
      (ord.subtotal - ord.vat).toFixed(2),
      ord.vat.toFixed(2),
      ord.discount.toFixed(2),
      ord.total.toFixed(2),
      ord.items.reduce((s, it) => s + it.quantity, 0)
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_مبيعات_قيد_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in print:p-0">
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base md:text-lg">
                {bLabel('report_sales_title', 'سجل المبيعات والتقارير المالية')}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {isBilingual 
                    ? `نظام التقارير المزدوج: العربية أساسية + ${activeLangConfig.name}` 
                    : 'نظام التقارير باللغة العربية القياسية'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowZReportPreview(prev => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                showZReportPreview 
                  ? 'bg-indigo-600 text-white shadow-indigo-100' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
              id="btn-toggle-zreport"
            >
              <Printer className="w-4 h-4" />
              <span>{showZReportPreview ? 'عرض جدول الفواتير' : bLabel('report_print_btn', 'طباعة تقرير الوردية (Z-Report)')}</span>
            </button>

            <button
              onClick={handleExportSalesCSV}
              disabled={orders.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              title="تصدير ملف إكسيل CSV"
              id="btn-export-sales-csv"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{bLabel('report_export_csv', 'تصدير المبيعات (Excel)')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer ml-1"
              id="btn-close-order-history"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics Top Cards */}
        <div className="p-5 bg-gray-50/70 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3.5 shrink-0">
          {/* Total Sales */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-400 text-[10px] font-bold truncate">
                {bLabel('report_total_sales', 'إجمالي المبيعات')}
              </span>
              <span className="font-mono font-bold text-gray-900 text-base truncate">
                {totalSales.toFixed(2)} {t('sar_currency', lang)}
              </span>
            </div>
          </div>

          {/* Profit Estimate */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-400 text-[10px] font-bold truncate">
                {bLabel('report_estimated_profit', 'صافي الأرباح التقريبية')}
              </span>
              <span className={`font-mono font-bold text-base truncate ${estimatedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {estimatedProfit.toFixed(2)} {t('sar_currency', lang)}
              </span>
            </div>
          </div>

          {/* Total orders */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-400 text-[10px] font-bold truncate">
                {bLabel('report_total_orders', 'عدد الفواتير')}
              </span>
              <span className="font-mono font-bold text-gray-900 text-base">
                {totalOrders} {isBilingual ? 'فاتورة / orders' : 'فاتورة'}
              </span>
            </div>
          </div>

          {/* Tax Collection */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-400 text-[10px] font-bold truncate">
                {bLabel('report_total_vat', 'الضريبة المحصلة (15%)')}
              </span>
              <span className="font-mono font-bold text-gray-900 text-base truncate">
                {totalVat.toFixed(2)} {t('sar_currency', lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Body View: Toggle between Z-Report Printable Sheet and Standard Orders Table */}
        {showZReportPreview ? (
          /* ==========================================================================
             Bilingual Z-Report / Sales Summary Printable View
             ========================================================================== */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-gray-100/60" id="sales-report-container">
            <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 text-gray-900 font-sans print:shadow-none print:border-none print:w-full print:p-0">
              
              {/* Report Actions Banner (print:hidden) */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 print:hidden">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-gray-900">
                    معاينة تقرير المبيعات المزدوج الجاهز للطباعة
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintZReport}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                    id="btn-print-zreport-action"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة التقرير (Print Report)</span>
                  </button>
                  <button
                    onClick={() => setShowZReportPreview(false)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    إغلاق المعاينة
                  </button>
                </div>
              </div>

              {/* Report Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-extrabold text-gray-950">{storeName}</h1>
                <h2 className="text-sm font-bold text-indigo-900 mt-1">
                  {isBilingual 
                    ? 'تقرير مبيعات الوردية والملخص المالي / Shift Sales Summary (Z-Report)' 
                    : 'تقرير مبيعات الوردية والملخص المالي (Z-Report)'}
                </h2>
                <p className="text-[11px] text-gray-500 font-mono mt-1">
                  {bLabel('vat_number_label', 'الرقم الضريبي')}: {storeVat}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {bLabel('report_date', 'تاريخ ووقت الإصدار')}: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}
                </p>
              </div>

              {/* Top Financial Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 mb-5 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-bold text-gray-900">{bLabel('report_total_sales', 'إجمالي المبيعات (شامل الضريبة)')}</span>
                  <span className="font-mono font-extrabold text-indigo-700 text-sm">{totalSales.toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{bLabel('report_net_sales', 'صافي المبيعات (بدون الضريبة)')}</span>
                  <span className="font-mono font-semibold">{netSales.toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{bLabel('report_total_vat', 'ضريبة القيمة المضافة المحصلة (15%)')}</span>
                  <span className="font-mono font-semibold text-amber-700">{totalVat.toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{bLabel('report_total_orders', 'عدد الفواتير الصادرة')}</span>
                  <span className="font-mono font-bold">{totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {isBilingual ? 'متوسط قيمة الفاتورة / Avg Order Value' : 'متوسط قيمة الفاتورة'}
                  </span>
                  <span className="font-mono font-semibold">{averageOrderValue.toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">{bLabel('report_estimated_profit', 'صافي الأرباح التقريبية')}</span>
                  <span className={`font-mono font-bold text-sm ${estimatedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {estimatedProfit.toFixed(2)} {t('sar_currency', lang)}
                  </span>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="mb-5">
                <h3 className="font-bold text-xs text-gray-900 mb-2 pb-1 border-b border-gray-200">
                  {isBilingual ? 'تفاصيل طرق الدفع / Payment Methods Breakdown' : 'تفاصيل طرق الدفع'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                    <div>
                      <div className="font-bold text-gray-800">{bLabel('payment_cash', 'نقداً')}</div>
                      <div className="text-[10px] text-gray-400">{paymentBreakdown.cash.count} {isBilingual ? 'عمليات / txns' : 'عمليات'}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{paymentBreakdown.cash.total.toFixed(2)}</span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                    <div>
                      <div className="font-bold text-gray-800">{bLabel('payment_mada', 'مدى')}</div>
                      <div className="text-[10px] text-gray-400">{paymentBreakdown.mada.count} {isBilingual ? 'عمليات / txns' : 'عمليات'}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{paymentBreakdown.mada.total.toFixed(2)}</span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                    <div>
                      <div className="font-bold text-gray-800">{bLabel('payment_visa', 'فيزا')}</div>
                      <div className="text-[10px] text-gray-400">{paymentBreakdown.visa.count} {isBilingual ? 'عمليات / txns' : 'عمليات'}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{paymentBreakdown.visa.total.toFixed(2)}</span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                    <div>
                      <div className="font-bold text-gray-800">{bLabel('payment_apple_pay', 'أبل باي')}</div>
                      <div className="text-[10px] text-gray-400">{paymentBreakdown.apple_pay.count} {isBilingual ? 'عمليات / txns' : 'عمليات'}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{paymentBreakdown.apple_pay.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Top Selling Items */}
              {topProducts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-xs text-gray-900 mb-2 pb-1 border-b border-gray-200">
                    {isBilingual ? 'أعلى السلع مبيعاً / Top Selling Products' : 'أعلى السلع مبيعاً'}
                  </h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 text-[10px]">
                        <th className="py-1 text-right">{bLabel('product_header', 'السلعة')}</th>
                        <th className="py-1 text-center">{bLabel('qty_header', 'الكمية')}</th>
                        <th className="py-1 text-left">{bLabel('total_header', 'المبيعات')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topProducts.map((p, idx) => (
                        <tr key={idx} className="py-1.5">
                          <td className="py-1.5 text-right font-medium">
                            <div>{p.name}</div>
                            {isBilingual && (
                              <div className="text-[9px] text-gray-400">{translateProduct(p.name, lang)}</div>
                            )}
                          </td>
                          <td className="py-1.5 text-center font-mono font-bold">{p.quantity}</td>
                          <td className="py-1.5 text-left font-mono font-bold">{p.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures for formal Shift Audit */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed border-gray-300 text-xs">
                <div className="flex flex-col gap-8">
                  <span className="text-gray-600 font-bold">
                    {isBilingual ? 'توقيع الكاشير / Cashier Signature:' : 'توقيع الكاشير:'}
                  </span>
                  <div className="border-b border-gray-300 w-36"></div>
                </div>
                <div className="flex flex-col gap-8">
                  <span className="text-gray-600 font-bold">
                    {isBilingual ? 'توقيع المشرف / Supervisor Signature:' : 'توقيع المشرف:'}
                  </span>
                  <div className="border-b border-gray-300 w-36"></div>
                </div>
              </div>

              <div className="mt-8 text-center text-[10px] text-gray-400">
                نظام قيد السحابي المتكامل لإدارة المبيعات ونقاط البيع | QAYD Cloud POS System
              </div>

            </div>
          </div>
        ) : (
          /* ==========================================================================
             Interactive Orders Table View
             ========================================================================== */
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            <div className="relative">
              <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                placeholder={isBilingual 
                  ? "ابحث برقم الفاتورة أو اسم المنتج / Search by invoice # or product..." 
                  : "ابحث عن فاتورة برقم الفاتورة أو وسيلة الدفع أو اسم المنتج..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2.5 bg-gray-100/70 hover:bg-gray-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-indigo-500/30 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
                id="input-orders-search"
              />
            </div>

            <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-white">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    {isBilingual ? 'سجل الفواتير فارغ / No orders recorded yet' : 'سجل الفواتير فارغ تماماً'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {isBilingual 
                      ? 'When sales are completed, receipts and reports will appear here.' 
                      : 'عند بيع أي بضاعة وطباعة فاتورة، ستظهر تقاريرها وإحصائياتها هنا.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 sticky top-0">
                      <tr>
                        <th className="px-5 py-3.5 text-right">{bLabel('invoice_number', 'رقم الفاتورة')}</th>
                        <th className="px-5 py-3.5 text-right">{bLabel('invoice_date', 'تاريخ ووقت البيع')}</th>
                        <th className="px-5 py-3.5 text-center">{bLabel('qty_header', 'عدد السلع')}</th>
                        <th className="px-5 py-3.5 text-right">{bLabel('select_payment', 'طريقة الدفع')}</th>
                        <th className="px-5 py-3.5 text-left">{bLabel('total_header', 'قيمة المبيعات')}</th>
                        <th className="px-5 py-3.5 text-left">{bLabel('vat', 'الضريبة (15%)')}</th>
                        <th className="px-5 py-3.5 text-left">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-gray-900 text-sm">
                            {order.invoiceNumber}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-gray-800">{formatDate(order.timestamp)}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{formatTime(order.timestamp)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center font-mono">
                            {order.items.reduce((qty, item) => qty + item.quantity, 0)} {t('items_unit', lang)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              order.paymentMethod === 'cash' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              <CreditCard className="w-3.5 h-3.5" />
                              {getPaymentMethodName(order.paymentMethod)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-left font-mono font-bold text-indigo-700 text-sm">
                            {order.total.toFixed(2)} {t('sar_currency', lang)}
                          </td>
                          <td className="px-5 py-4 text-left font-mono text-gray-500">
                            {order.vat.toFixed(2)} {t('sar_currency', lang)}
                          </td>
                          <td className="px-5 py-4 text-left">
                            {refundConfirmOrderId === order.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-fade-in justify-end">
                                <span className="text-[10px] font-bold text-rose-700 px-1">تأكيد الإرجاع؟</span>
                                <button
                                  onClick={() => {
                                    onRefundOrder(order.id);
                                    setRefundConfirmOrderId(null);
                                  }}
                                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  نعم، إرجاع
                                </button>
                                <button
                                  onClick={() => setRefundConfirmOrderId(null)}
                                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  تراجع
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => onSelectOrderForPrint(order)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                                  title="استعراض وطباعة الفاتورة"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isBilingual ? 'استعراض / View' : 'استعراض الفاتورة'}</span>
                                </button>
                                <button
                                  onClick={() => setRefundConfirmOrderId(order.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                                  title="إرجاع البضاعة"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>{isBilingual ? 'مرتجع / Refund' : 'مرتجع'}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
