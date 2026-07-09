import { useState } from 'react';
import { History, TrendingUp, ShoppingBag, CreditCard, RotateCcw, Eye, X, Calendar, DollarSign, Wallet, Search, Download } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onRefundOrder: (id: string) => void;
  onSelectOrderForPrint: (order: Order) => void;
  onClose: () => void;
}

export default function OrderHistory({ orders, onRefundOrder, onSelectOrderForPrint, onClose }: OrderHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refundConfirmOrderId, setRefundConfirmOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => 
    o.invoiceNumber.includes(searchTerm) || 
    o.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics Calculations
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalVat = orders.reduce((sum, o) => sum + o.vat, 0);
  const totalOrders = orders.length;

  // Let's compute estimated cost vs sales to get a nice profit metric
  const estimatedCost = orders.reduce((sum, o) => {
    const orderCost = o.items.reduce((itemSum, item) => {
      const cost = item.product.costPrice || (item.product.price * 0.7); // Fallback: 30% margin if costPrice is undefined
      return itemSum + (cost * item.quantity);
    }, 0);
    return sum + orderCost;
  }, 0);

  const estimatedProfit = totalSales > 0 ? (totalSales - totalVat) - estimatedCost : 0;

  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (epoch: number) => {
    return new Date(epoch).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'نقداً';
      case 'mada': return 'مدى';
      case 'visa': return 'فيزا';
      case 'apple_pay': return 'أبل باي';
      default: return method;
    }
  };

  const handleExportSalesCSV = () => {
    let csvContent = "\uFEFF";
    csvContent += "رقم الفاتورة,تاريخ البيع,الوقت,عدد السلع,طريقة الدفع,المجموع الكلي (شامل الضريبة),ضريبة القيمة المضافة (15%),الخصم\n";
    
    orders.forEach((o) => {
      const dateText = new Date(o.timestamp).toLocaleDateString('ar-SA');
      const timeText = new Date(o.timestamp).toLocaleTimeString('ar-SA');
      const itemsCount = o.items.reduce((qty, item) => qty + item.quantity, 0);
      const row = [
        o.invoiceNumber,
        `"${dateText}"`,
        `"${timeText}"`,
        itemsCount,
        `"${getPaymentMethodLabel(o.paymentMethod)}"`,
        o.total.toFixed(2),
        o.vat.toFixed(2),
        o.discount.toFixed(2)
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_مبيعات_البقالة_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col relative" id="sales-history-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-lg">سجل المبيعات والتقارير</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analytics Top Cards */}
        <div className="p-5 bg-gray-50/50 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] font-bold">إجمالي المبيعات (شامل الضريبة)</span>
              <span className="font-mono font-bold text-gray-900 text-base">{totalSales.toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* Card 2: Profit Estimate */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] font-bold">صافي الأرباح التقريبية</span>
              <span className={`font-mono font-bold text-base ${estimatedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {estimatedProfit.toFixed(2)} ر.س
              </span>
            </div>
          </div>

          {/* Card 3: Total orders */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] font-bold">عدد الفواتير الصادرة</span>
              <span className="font-mono font-bold text-gray-900 text-base">{totalOrders} فاتورة</span>
            </div>
          </div>

          {/* Card 4: Tax Collection */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] font-bold">ضريبة القيمة المضافة المحصلة (15%)</span>
              <span className="font-mono font-bold text-gray-900 text-base">{totalVat.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        {/* Search & Orders List Table */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                placeholder="ابحث عن فاتورة برقم الفاتورة أو وسيلة الدفع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-100/70 hover:bg-gray-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-indigo-500/30 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>
            <button
              onClick={handleExportSalesCSV}
              disabled={orders.length === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-sm shadow-emerald-100 cursor-pointer"
              title="تنزيل تقرير المبيعات كملف إكسيل CSV"
            >
              <Download className="w-4 h-4" />
              <span>تصدير المبيعات (Excel)</span>
            </button>
          </div>

          <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-white">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm">سجل الفواتير فارغ تماماً</p>
                <p className="text-gray-400 text-xs mt-1">عند بيع أي بضاعة وطباعة فاتورة، ستظهر تقاريرها وإحصائياتها هنا.</p>
              </div>
            ) : (
              <div className="overflow-x-auto h-full">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="px-5 py-3.5">رقم الفاتورة</th>
                      <th className="px-5 py-3.5">تاريخ ووقت البيع</th>
                      <th className="px-5 py-3.5 text-center">عدد السلع</th>
                      <th className="px-5 py-3.5">طريقة الدفع</th>
                      <th className="px-5 py-3.5 text-left">قيمة المبيعات</th>
                      <th className="px-5 py-3.5 text-left">الضريبة (15%)</th>
                      <th className="px-5 py-3.5 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-gray-900 text-sm">
                          {order.invoiceNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span>{formatDate(order.timestamp)}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{formatTime(order.timestamp)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-mono">
                          {order.items.reduce((qty, item) => qty + item.quantity, 0)} قطع
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            order.paymentMethod === 'cash' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            <CreditCard className="w-3.5 h-3.5" />
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-left font-mono font-bold text-indigo-700 text-sm">
                          {order.total.toFixed(2)} ر.س
                        </td>
                        <td className="px-5 py-4 text-left font-mono text-gray-500">
                          {order.vat.toFixed(2)} ر.س
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
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>استعراض الفاتورة</span>
                              </button>
                              <button
                                onClick={() => setRefundConfirmOrderId(order.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-semibold rounded-lg transition-colors cursor-pointer"
                                title="إرجاع البضاعة"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>مرتجع</span>
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
      </div>
    </div>
  );
}
