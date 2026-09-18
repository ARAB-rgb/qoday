import { useEffect, useRef } from 'react';
import { Printer, X, Download, Globe } from 'lucide-react';
import { Order } from '../types';
import { LanguageCode, t, translateProduct, getBilingualText, LANGUAGES } from '../lib/translations';

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
  storeName = 'مؤسسة قيد التجارية',
  storeVat = '300055443300003',
  welcomeMsg = 'نشكركم لتسوقكم معنا!',
  storeCr = '1010000000',
  vatRate = 15
}: ReceiptProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeLangConfig = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const isBilingual = lang !== 'ar';

  useEffect(() => {
    if (!order || !canvasRef.current) return;

    // Generate ZATCA Zakat & Tax compliant Base64 QR code
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

  /**
   * Always renders Arabic as primary and prominent.
   * If non-Arabic is selected, renders secondary translated line directly beneath.
   */
  const renderBilingualBlock = (key: string, arabicText: string) => {
    if (!isBilingual) {
      return <span className="font-semibold text-gray-900">{arabicText}</span>;
    }
    const translated = t(key, lang);
    return (
      <div className="flex flex-col text-right items-start leading-tight">
        <span className="font-bold text-gray-950">{arabicText}</span>
        <span className="text-[9px] text-gray-500 font-sans tracking-wide">{translated}</span>
      </div>
    );
  };

  const renderBilingualInline = (key: string, arabicText: string) => {
    if (!isBilingual) {
      return arabicText;
    }
    const translated = t(key, lang);
    return getBilingualText(arabicText, translated, lang);
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
    text += `       ${renderBilingualInline('grocery_subtitle', 'للمواد الغذائية والاستهلاكية')}\n`;
    text += `   ${renderBilingualInline('grocery_address', 'شارع الأمير محمد بن عبدالعزيز، الرياض')}\n`;
    text += "         جوال: 0556446888\n";
    text += `     ${renderBilingualInline('vat_number_label', 'الرقم الضريبي')}: ${storeVat}\n`;
    if (storeCr) {
      text += `     ${renderBilingualInline('cr_number_label', 'السجل التجاري')}: ${storeCr}\n`;
    }
    text += `${separator}\n`;
    text += `${renderBilingualInline('invoice_number', 'رقم الفاتورة')}: ${order.invoiceNumber}\n`;
    text += `${renderBilingualInline('invoice_date', 'التاريخ')}: ${formatDate(order.timestamp)}\n`;
    text += `${renderBilingualInline('invoice_time', 'الوقت')}: ${formatTime(order.timestamp)}\n`;
    text += `${renderBilingualInline('invoice_cashier', 'الكاشير')}: ${renderBilingualInline('invoice_cashier_name', 'أبو فهد (رئيسي)')}\n`;
    text += `${renderBilingualInline('invoice_status', 'حالة الدفع')}: ${renderBilingualInline('invoice_status_paid', 'مقبول / ناجح')}\n`;
    text += `${separator}\n`;
    
    // Column headers
    text += isBilingual
      ? "المنتج / Product          الكمية / Qty   السعر / Price   المجموع / Total\n"
      : "المنتج                   الكمية   السعر    المجموع\n";

    order.items.forEach((item) => {
      let name = item.product.name;
      if (isBilingual) {
        name = `${item.product.name} (${translateProduct(item.product.name, lang)})`;
      }
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
    text += `${renderBilingualInline('subtotal_no_vat', 'المجموع الفرعي (غير شامل الضريبة)')}: ${(order.subtotal - order.vat).toFixed(2)} ر.س\n`;
    if (order.discount > 0) {
      text += `${renderBilingualInline('discount', 'الخصم')}: -${order.discount.toFixed(2)} ر.س\n`;
    }
    text += `${renderBilingualInline('vat', `ضريبة القيمة المضافة (${vatRate}%)`)}: ${order.vat.toFixed(2)} ر.س\n`;
    text += `${renderBilingualInline('total_with_vat', 'الإجمالي الكلي (شامل الضريبة)')}: ${order.total.toFixed(2)} ر.س\n`;
    text += `${separator}\n`;
    text += `${renderBilingualInline('payment_method', 'طريقة الدفع')}: ${getPaymentMethodLabel(order.paymentMethod)}\n`;
    if (order.paymentMethod === 'cash') {
      text += `${renderBilingualInline('received_amount', 'المبلغ المستلم')}: ${(order.receivedAmount || 0).toFixed(2)} ر.س\n`;
      text += `${renderBilingualInline('change_amount', 'المتبقي (المسترجع)')}: ${(order.changeAmount || 0).toFixed(2)} ر.س\n`;
    }
    text += `${separator}\n`;
    text += `${renderBilingualInline('invoice_footer_msg1', 'فاتورة ضريبية مبسطة طبقاً لهيئة الزكاة والضريبة والجمارك')}\n`;
    text += `            ${welcomeMsg}\n`;
    
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
            <Printer className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {t('receipt_title', lang, 'فاتورة البيع المبسطة')}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                <Globe className="w-3 h-3 text-indigo-500" />
                {isBilingual ? (
                  <span className="text-indigo-700 font-bold">
                    الطباعة المزدوجة نشطة: العربية أساسية + {activeLangConfig.name} ({activeLangConfig.nativeName})
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    الطباعة باللغة العربية القياسية المعتمدة (ZATCA)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTXT}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
              id="btn-receipt-download-txt"
            >
              <Download className="w-4 h-4" />
              <span>{t('btn_download_txt', lang, 'تحميل الفاتورة (TXT)')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
              id="btn-receipt-print"
            >
              <Printer className="w-4 h-4" />
              <span>{t('btn_print', lang, 'طباعة (Print)')}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
                id="btn-receipt-close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* The Thermal Bill layout */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-gray-100/60 print:bg-white print:p-0">
        <div className="w-[300px] md:w-[360px] bg-white p-5 shadow-md border border-gray-200/80 rounded-2xl print:shadow-none print:border-none print:w-full print:p-0 print:m-0 font-sans leading-relaxed text-xs">
          
          {/* Header */}
          <div className="text-center mb-3">
            <h1 className="text-lg font-extrabold text-gray-950 tracking-tight">{storeName}</h1>
            {isBilingual && (
              <h2 className="text-xs font-bold text-indigo-700 mt-0.5 font-sans">
                {t('app_title', lang)}
              </h2>
            )}
            <p className="text-[10px] text-gray-600 font-semibold mt-1">
              {renderBilingualInline('grocery_subtitle', 'للمواد الغذائية والاستهلاكية')}
            </p>
            <p className="text-[10px] text-gray-500">
              {renderBilingualInline('grocery_address', 'شارع الأمير محمد بن عبدالعزيز، الرياض')}
            </p>
            <p className="text-[10px] text-gray-500">
              {renderBilingualInline('grocery_phone', 'جوال: 0556446888')}
            </p>
            <p className="text-[10px] font-mono text-gray-800 mt-1">
              <span className="font-bold">{renderBilingualInline('vat_number_label', 'الرقم الضريبي')}:</span> {storeVat}
            </p>
            {storeCr && (
              <p className="text-[10px] font-mono text-gray-800 mt-0.5">
                <span className="font-bold">{renderBilingualInline('cr_number_label', 'السجل التجاري')}:</span> {storeCr}
              </p>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-2.5"></div>

          {/* Invoice Metadata */}
          <div className="space-y-1.5 text-[10px] text-gray-700 mb-3">
            <div className="flex justify-between items-center">
              {renderBilingualBlock('invoice_number', 'رقم الفاتورة')}
              <span className="font-mono font-extrabold text-gray-950 text-xs">{order.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              {renderBilingualBlock('invoice_date', 'التاريخ')}
              <span className="font-medium text-gray-800 font-mono">{formatDate(order.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center">
              {renderBilingualBlock('invoice_time', 'الوقت')}
              <span className="font-medium text-gray-800 font-mono">{formatTime(order.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center">
              {renderBilingualBlock('invoice_cashier', 'الكاشير')}
              <span className="font-medium text-gray-800">{renderBilingualInline('invoice_cashier_name', 'أبو فهد (رئيسي)')}</span>
            </div>
            <div className="flex justify-between items-center">
              {renderBilingualBlock('invoice_status', 'حالة الدفع')}
              <span className="text-emerald-700 font-bold font-mono">{renderBilingualInline('invoice_status_paid', 'مقبول / ناجح')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-2.5"></div>

          {/* Cart Table Headers */}
          <div className="grid grid-cols-12 gap-1 font-bold text-gray-900 text-[10px] mb-2 pb-1 border-b border-gray-200">
            <span className="col-span-6">{renderBilingualInline('product_header', 'المنتج')}</span>
            <span className="col-span-2 text-center">{renderBilingualInline('qty_header', 'الكمية')}</span>
            <span className="col-span-2 text-left">{renderBilingualInline('price_header', 'السعر')}</span>
            <span className="col-span-2 text-left">{renderBilingualInline('total_header', 'المجموع')}</span>
          </div>

          {/* Cart Items */}
          <div className="space-y-2 text-[10px] text-gray-800 mb-3">
            {order.items.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 gap-1 items-start">
                <div className="col-span-6 flex flex-col">
                  <span className="font-bold text-gray-950 leading-snug">{item.product.name}</span>
                  {isBilingual && (
                    <span className="text-[9px] text-gray-500 font-sans tracking-wide leading-snug">
                      {translateProduct(item.product.name, lang)}
                    </span>
                  )}
                  <span className="text-[8px] text-gray-400 font-mono">#{item.product.barcode}</span>
                </div>
                <span className="col-span-2 text-center font-mono self-center font-semibold">{item.quantity}</span>
                <span className="col-span-2 text-left font-mono self-center text-gray-700">{item.product.price.toFixed(2)}</span>
                <span className="col-span-2 text-left font-mono font-extrabold text-gray-950 self-center">
                  {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-2.5"></div>

          {/* Financial Summaries */}
          <div className="space-y-1.5 text-[10px] text-gray-700 mb-3">
            <div className="flex justify-between items-center">
              {renderBilingualBlock('subtotal_no_vat', 'المجموع الفرعي (غير شامل الضريبة)')}
              <span className="font-mono font-semibold">{(order.subtotal - order.vat).toFixed(2)} {t('sar_currency', lang)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between items-center text-rose-600">
                {renderBilingualBlock('discount', 'الخصم')}
                <span className="font-mono font-bold">-{order.discount.toFixed(2)} {t('sar_currency', lang)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              {renderBilingualBlock('vat', `ضريبة القيمة المضافة (${vatRate}%)`)}
              <span className="font-mono font-semibold">{order.vat.toFixed(2)} {t('sar_currency', lang)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-950 pt-1.5 border-t border-gray-200">
              {renderBilingualBlock('total_with_vat', 'الإجمالي الكلي (شامل الضريبة)')}
              <span className="font-mono text-sm font-extrabold text-indigo-950">
                {order.total.toFixed(2)} {t('sar_currency', lang)}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-2.5"></div>

          {/* Payment breakdown */}
          <div className="space-y-1.5 text-[10px] text-gray-700 mb-3">
            <div className="flex justify-between items-center">
              {renderBilingualBlock('select_payment', 'طريقة الدفع')}
              <span className="font-bold text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>
            {order.paymentMethod === 'cash' && order.receivedAmount !== undefined && (
              <>
                <div className="flex justify-between items-center">
                  {renderBilingualBlock('received_amount', 'المبلغ المستلم')}
                  <span className="font-mono font-bold text-gray-900">{(order.receivedAmount || 0).toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-emerald-800">
                  {renderBilingualBlock('change_amount', 'المتبقي (المسترجع)')}
                  <span className="font-mono font-extrabold text-sm">{(order.changeAmount || 0).toFixed(2)} {t('sar_currency', lang)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-2.5"></div>

          {/* ZATCA QR Code & Bottom Message */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div className="bg-white p-1.5 border border-gray-300 rounded-xl mb-2 shadow-2xs">
              <canvas
                ref={canvasRef}
                width="130"
                height="130"
                className="w-[110px] h-[110px] block"
              ></canvas>
            </div>
            <div className="space-y-1 text-center w-full">
              <p className="text-[9px] text-gray-600 font-bold">
                {renderBilingualInline('invoice_footer_msg1', 'فاتورة ضريبية مبسطة طبقاً لهيئة الزكاة والضريبة والجمارك')}
              </p>
              <p className="text-[10px] font-extrabold text-gray-950 mt-1">
                {welcomeMsg}
              </p>
              <p className="text-[8px] text-gray-500">
                {renderBilingualInline('invoice_footer_msg3', 'تُستبدل وتُسترجع البضائع خلال ٣ أيام بشرط حالتها الأصلية')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
