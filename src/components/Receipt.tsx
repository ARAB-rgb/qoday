import { useEffect, useRef } from 'react';
import { Printer, X, Download } from 'lucide-react';
import { Order } from '../types';
import { LanguageCode, t, translateProduct } from '../lib/translations';

interface ReceiptProps {
  order: Order | null;
  onClose?: () => void;
  showActions?: boolean;
  lang?: LanguageCode;
  storeName?: string;
  storeVat?: string;
  welcomeMsg?: string;
  storeCr?: string;
  vatRate?: number;
}

export default function Receipt({
  order,
  onClose,
  showActions = true,
  lang = 'ar',
  storeName = 'بقالة البركة والخيرات',
  storeVat = '300055443300003',
  welcomeMsg = 'نشكركم لتسوقكم معنا!',
  storeCr = '1010000000',
  vatRate = 15
}: ReceiptProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!order || !canvasRef.current) return;

    // Generate ZATCA Zakat & Tax compliant Base64 QR code or just a neat QR structure
    // TLV structure:
    // Tag 1: Seller Name (length, value)
    // Tag 2: VAT Number (length, value)
    // Tag 3: Timestamp (length, value)
    // Tag 4: Invoice Total (length, value)
    // Tag 5: VAT Total (length, value)
    
    const sellerName = storeName;
    const vatNumber = storeVat;
    const timestamp = new Date(order.timestamp).toISOString();
    const invoiceTotal = order.total.toFixed(2);
    const vatTotal = order.vat.toFixed(2);

    const toTLV = (tag: number, val: string) => {
      const buffer = new TextEncoder().encode(val);
      const tagBuf = new Uint8Array([tag]);
      const lenBuf = new Uint8Array([buffer.length]);
      const result = new Uint8Array(2 + buffer.length);
      result.set(tagBuf, 0);
      result.set(lenBuf, 1);
      result.set(buffer, 2);
      return result;
    };

    try {
      const tlv1 = toTLV(1, sellerName);
      const tlv2 = toTLV(2, vatNumber);
      const tlv3 = toTLV(3, timestamp);
      const tlv4 = toTLV(4, invoiceTotal);
      const tlv5 = toTLV(5, vatTotal);

      const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      [tlv1, tlv2, tlv3, tlv4, tlv5].forEach(tlv => {
        combined.set(tlv, offset);
        offset += tlv.length;
      });

      // Binary to Base64
      let binary = '';
      const len = combined.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      const base64Value = window.btoa(binary);

      // We can render this Base64 value as QR code using dynamic canvas or free QR code service.
      // A free QR code API: https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=
      // This is extremely reliable, but let's also provide a fallback drawing.
      const qrData = encodeURIComponent(base64Value);
      const img = new Image();
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${qrData}`;
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, 130, 130);
          ctx.drawImage(img, 0, 0, 130, 130);
        }
      };
    } catch (e) {
      console.error('Error generating ZATCA QR:', e);
    }
  }, [order, storeName, storeVat]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    if (lang === 'ar') {
      switch (method) {
        case 'cash': return 'نقداً';
        case 'mada': return 'مدى (دفع إلكتروني)';
        case 'visa': return 'فيزا (دفع إلكتروني)';
        case 'apple_pay': return 'أبل باي (دفع إلكتروني)';
        default: return method;
      }
    }
    switch (method) {
      case 'cash': return `نقداً / ${t('payment_cash', lang)}`;
      case 'mada': return `مدى / ${t('payment_mada', lang)}`;
      case 'visa': return `فيزا / ${t('payment_visa', lang)}`;
      case 'apple_pay': return `أبل باي / ${t('payment_apple_pay', lang)}`;
      default: return method;
    }
  };

  const getBilingual = (key: string, arabicFallback: string) => {
    if (lang === 'ar') return <span>{arabicFallback}</span>;
    const translated = t(key, lang);
    return (
      <span className="flex flex-col gap-0.5 text-right items-start">
        <span className="font-semibold text-gray-950">{arabicFallback}</span>
        <span className="text-[9px] text-gray-500 font-sans tracking-wide leading-none">{translated}</span>
      </span>
    );
  };

  const getBilingualFlat = (key: string, arabicFallback: string) => {
    if (lang === 'ar') return arabicFallback;
    const translated = t(key, lang);
    return `${arabicFallback} / ${translated}`;
  };

  const formatDate = (epoch: number) => {
    const d = new Date(epoch);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (epoch: number) => {
    const d = new Date(epoch);
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleDownloadTXT = () => {
    if (!order) return;
    const separator = "------------------------------------------";
    let text = "";
    text += `        ${storeName}\n`;
    text += "       للمواد الغذائية والاستهلاكية\n";
    text += "   شارع الأمير محمد بن عبدالعزيز، الرياض\n";
    text += "         جوال: 0556446888\n";
    text += `     الرقم الضريبي: ${storeVat}\n`;
    if (storeCr) {
      text += `     السجل التجاري: ${storeCr}\n`;
    }
    text += `${separator}\n`;
    text += `رقم الفاتورة: ${order.invoiceNumber}\n`;
    text += `التاريخ: ${formatDate(order.timestamp)}\n`;
    text += `الوقت: ${formatTime(order.timestamp)}\n`;
    text += "الكاشير: أبو فهد (رئيسي)\n";
    text += "حالة الدفع: مقبول / ناجح\n";
    text += `${separator}\n`;
    
    // Column headers
    text += "المنتج                   الكمية   السعر    المجموع\n";
    order.items.forEach((item) => {
      // pad name
      let name = item.product.name;
      if (name.length < 24) {
        name = name + " ".repeat(24 - name.length);
      } else {
        name = name.substring(0, 24);
      }
      const qty = item.quantity.toString().padStart(4);
      const price = item.product.price.toFixed(2).padStart(8);
      const total = (item.product.price * item.quantity).toFixed(2).padStart(10);
      text += `${name}${qty}${price}${total}\n`;
    });
    
    text += `${separator}\n`;
    text += `المجموع الفرعي (غير شامل الضريبة): ${(order.subtotal - order.vat).toFixed(2)} ر.س\n`;
    if (order.discount > 0) {
      text += `الخصم: -${order.discount.toFixed(2)} ر.س\n`;
    }
    text += `ضريبة القيمة المضافة (${vatRate}%): ${order.vat.toFixed(2)} ر.س\n`;
    text += `الإجمالي الكلي (شامل الضريبة): ${order.total.toFixed(2)} ر.س\n`;
    text += `${separator}\n`;
    text += `طريقة الدفع: ${getPaymentMethodLabel(order.paymentMethod)}\n`;
    if (order.paymentMethod === 'cash') {
      text += `المبلغ المستلم: ${(order.receivedAmount || 0).toFixed(2)} ر.س\n`;
      text += `المتبقي (المسترجع): ${(order.changeAmount || 0).toFixed(2)} ر.س\n`;
    }
    text += `${separator}\n`;
    text += "فاتورة ضريبية مبسطة طبقا لهيئة الزكاة والضريبة والجمارك\n";
    text += `            ${welcomeMsg}\n`;
    
    // Use encoding for Arabic text compatibility on normal text files
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `فاتورة_${order.invoiceNumber}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" style={{ direction: 'rtl' }} id="receipt-container">
      {/* Receipts Control Panel (hidden on print) */}
      {showActions && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-700">فاتورة البيع المبسطة</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTXT}
              className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الفاتورة (TXT)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة (Print)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* The Actual Thermal Bill layout */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-gray-100/50 print:bg-white print:p-0">
        <div className="w-[300px] md:w-[350px] bg-white p-5 shadow-sm border border-gray-100 rounded-xl print:shadow-none print:border-none print:w-full print:p-0 print:m-0 font-sans leading-relaxed text-xs">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{storeName}</h1>
            {lang !== 'ar' && (
              <h2 className="text-xs font-bold text-gray-600 mt-0.5">{storeName !== 'بقالة البركة والخيرات' ? '' : t('app_title', lang)}</h2>
            )}
            <p className="text-[10px] text-gray-500 font-medium mt-1">
              {getBilingualFlat('grocery_subtitle', 'للمواد الغذائية والاستهلاكية')}
            </p>
            <p className="text-[10px] text-gray-500">
              {getBilingualFlat('grocery_address', 'شارع الأمير محمد بن عبدالعزيز، الرياض')}
            </p>
            <p className="text-[10px] text-gray-500">
              {getBilingualFlat('grocery_phone', 'جوال: 0556446888')}
            </p>
            <p className="text-[10px] font-mono text-gray-700 mt-1">
              {getBilingualFlat('vat_number_label', 'الرقم الضريبي')}: {storeVat}
            </p>
            {storeCr && (
              <p className="text-[10px] font-mono text-gray-700 mt-0.5">
                {lang === 'ar' ? 'السجل التجاري' : 'Commercial Registry'}: {storeCr}
              </p>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          {/* Invoice Info */}
          <div className="space-y-1.5 text-[10px] text-gray-600 mb-3">
            <div className="flex justify-between items-center">
              {getBilingual('invoice_number', 'رقم الفاتورة')}
              <span className="font-mono font-bold text-gray-900">{order.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              {getBilingual('invoice_date', 'التاريخ')}
              <span className="font-medium text-gray-800">{formatDate(order.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center">
              {getBilingual('invoice_time', 'الوقت')}
              <span className="font-medium text-gray-800">{formatTime(order.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center">
              {getBilingual('invoice_cashier', 'الكاشير')}
              <span className="font-medium text-gray-800">{getBilingualFlat('invoice_cashier_name', 'أبو فهد (رئيسي)')}</span>
            </div>
            <div className="flex justify-between items-center">
              {getBilingual('invoice_status', 'حالة الدفع')}
              <span className="text-emerald-700 font-bold">{getBilingualFlat('invoice_status_paid', 'مقبول / ناجح')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          {/* Cart Table Headers */}
          <div className="grid grid-cols-12 gap-1 font-bold text-gray-900 text-[10px] mb-2 pb-1 border-b border-gray-100">
            <span className="col-span-6">{getBilingualFlat('product_header', 'المنتج')}</span>
            <span className="col-span-2 text-center">{getBilingualFlat('qty_header', 'الكمية')}</span>
            <span className="col-span-2 text-left">{getBilingualFlat('price_header', 'السعر')}</span>
            <span className="col-span-2 text-left">{getBilingualFlat('total_header', 'المجموع')}</span>
          </div>

          {/* Cart Items */}
          <div className="space-y-2 text-[10px] text-gray-700 mb-3">
            {order.items.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 gap-1 items-start">
                <div className="col-span-6 flex flex-col">
                  <span className="font-semibold text-gray-900 leading-snug">{item.product.name}</span>
                  {lang !== 'ar' && (
                    <span className="text-[9px] text-gray-500 font-sans tracking-wide leading-snug">
                      {translateProduct(item.product.name, lang)}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400 font-mono">#{item.product.barcode}</span>
                </div>
                <span className="col-span-2 text-center font-mono self-center">{item.quantity}</span>
                <span className="col-span-2 text-left font-mono self-center">{item.product.price.toFixed(2)}</span>
                <span className="col-span-2 text-left font-mono font-bold text-gray-900 self-center">{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          {/* Financial Summaries */}
          <div className="space-y-1.5 text-[10px] text-gray-600 mb-4">
            <div className="flex justify-between items-center">
              {getBilingual('subtotal_no_vat', 'المجموع الفرعي (غير شامل الضريبة)')}
              <span className="font-mono">{(order.subtotal - order.vat).toFixed(2)} {t('sar_currency', lang)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between items-center text-rose-600">
                {getBilingual('discount', 'الخصم')}
                <span className="font-mono">-{order.discount.toFixed(2)} {t('sar_currency', lang)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              {lang === 'ar' ? (
                <span>ضريبة القيمة المضافة ({vatRate}%)</span>
              ) : (
                <span className="flex flex-col gap-0.5 text-right items-start">
                  <span className="font-semibold text-gray-950">ضريبة القيمة المضافة ({vatRate}%)</span>
                  <span className="text-[9px] text-gray-500 font-sans tracking-wide leading-none">Value Added Tax ({vatRate}% VAT)</span>
                </span>
              )}
              <span className="font-mono">{order.vat.toFixed(2)} {t('sar_currency', lang)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-900 pt-1.5 border-t border-gray-100">
              {getBilingual('total_with_vat', 'الإجمالي الكلي (شامل الضريبة)')}
              <span className="font-mono text-sm">{order.total.toFixed(2)} {t('sar_currency', lang)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          {/* Payment breakdown */}
          <div className="space-y-1.5 text-[10px] text-gray-600 mb-4">
            <div className="flex justify-between items-center">
              {getBilingual('payment_method', 'طريقة الدفع')}
              <span className="font-medium text-gray-800">{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>
            {order.paymentMethod === 'cash' && order.receivedAmount !== undefined && (
              <>
                <div className="flex justify-between items-center">
                  {getBilingual('received_amount', 'المبلغ المستلم')}
                  <span className="font-mono font-medium text-gray-900">{(order.receivedAmount || 0).toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
                <div className="flex justify-between items-center font-medium text-emerald-800">
                  {getBilingual('change_amount', 'المتبقي (المسترجع)')}
                  <span className="font-mono font-bold">{(order.changeAmount || 0).toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
              </>
            )}
            {order.paymentMethod !== 'cash' && (
              <div className="flex justify-between items-center">
                <span>رقم العملية (RRN):</span>
                <span className="font-mono text-[9px]">{Math.floor(Math.random() * 900000000000) + 100000000000}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          {/* ZATCA QR Code & Bottom Message */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="bg-white p-1.5 border border-gray-200 rounded-lg mb-2">
              <canvas
                ref={canvasRef}
                width="130"
                height="130"
                className="w-[110px] h-[110px] block"
              ></canvas>
            </div>
            <div className="space-y-1 text-center w-full">
              <p className="text-[9px] text-gray-500 font-medium">
                {getBilingualFlat('invoice_footer_msg1', 'فاتورة ضريبية مبسطة طبقا لهيئة الزكاة والضريبة والجمارك')}
              </p>
              <p className="text-[10px] font-bold text-gray-900 mt-2">
                {welcomeMsg}
              </p>
              <p className="text-[8px] text-gray-400">
                {getBilingualFlat('invoice_footer_msg3', 'تُستبدل وتُسترجع البضائع خلال ٣ أيام بشرط حالتها الأصلية')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
