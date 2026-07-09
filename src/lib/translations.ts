/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'ar' | 'hi' | 'bn' | 'tl' | 'ur';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Filipino', flag: '🇵🇭', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' }
];

export const TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // App Header & Branding
  app_title: {
    ar: 'بقالة البركة والخيرات',
    hi: 'बरका और खैरात किराना स्टोर',
    bn: 'বারাকা ও খায়রাত মুদি দোকান',
    tl: 'Al Baraka Grocery Store',
    ur: 'برکہ اور خیرات کریانہ اسٹور'
  },
  grocery_subtitle: {
    ar: 'للمواد الغذائية والاستهلاكية',
    hi: 'खाद्य और उपभोक्ता सामान',
    bn: 'খাদ্য এবং ভোক্তা পণ্য',
    tl: 'Mga Pagkain at Consumer Goods',
    ur: 'غذائی اور اشیائے صرف'
  },
  grocery_address: {
    ar: 'شارع الأمير محمد بن عبدالعزيز، الرياض',
    hi: 'प्रिंस मुहम्मद बिन अब्दुलअज़ीज़ स्ट्रीट, रियाद',
    bn: 'প্রিন্স মুহাম্মদ বিন আবদুল আজিজ স্ট্রিট, রিয়াদ',
    tl: 'Prince Muhammad Bin Abdulaziz Street, Riyadh',
    ur: 'پرنس محمد بن عبدالعزیز اسٹریٹ، ریاض'
  },
  grocery_phone: {
    ar: 'جوال: 0556446888',
    hi: 'मोबाइल: 0556446888',
    bn: 'মোবাইল: 0556446888',
    tl: 'Mob: 0556446888',
    ur: 'موبائل: 0556446888'
  },
  vat_number_label: {
    ar: 'الرقم الضريبي',
    hi: 'टैक्स संख्या (VAT)',
    bn: 'ভ্যাট নম্বর',
    tl: 'VAT Number',
    ur: 'ٹیکس نمبر'
  },
  product_header: {
    ar: 'المنتج',
    hi: 'उत्पाद (Product)',
    bn: 'পণ্য (Product)',
    tl: 'Produkto (Product)',
    ur: 'پروڈکٹ (Product)'
  },
  qty_header: {
    ar: 'الكمية',
    hi: 'ماत्रा (Qty)',
    bn: 'পরিমাণ (Qty)',
    tl: 'Dami (Qty)',
    ur: 'مقدار (Qty)'
  },
  price_header: {
    ar: 'السعر',
    hi: 'मूल्य (Price)',
    bn: 'মূল্য (Price)',
    tl: 'Presyo (Price)',
    ur: 'قیمت (Price)'
  },
  total_header: {
    ar: 'المجموع',
    hi: 'कुल (Total)',
    bn: 'মোট (Total)',
    tl: 'Kabuuan (Total)',
    ur: 'ٹوٹل (Total)'
  },
  app_subtitle: {
    ar: 'نظام كاشير البقالة السريع والمبسط المتوافق مع هيئة الزكاة والضريبة والجمارك',
    hi: 'ज़कात और टैक्स अथॉरिटी के नियमों के अनुरूप तेज़ और आसान पीओएस सिस्टम',
    bn: 'যাকাত ও ট্যাক্স কর্তৃপক্ষের নিয়ম মেনে দ্রুত এবং সহজ পিওএস সিস্টেম',
    tl: 'Mabilis at madaling POS System na sumusunod sa regulasyon ng Zakat at Tax Authority',
    ur: 'زکوٰۃ اور ٹیکس اتھارٹی کے قوانین کے مطابق تیز اور آسان پی او ایس سسٹم'
  },
  pos_smart_badge: {
    ar: 'نقطة بيع ذكية',
    hi: 'स्मार्ट पीओएस',
    bn: 'স্মार्ट পিওএস',
    tl: 'Smart POS',
    ur: 'اسمارٹ پی او ایس'
  },
  btn_offline: {
    ar: 'التحميل والعمل أوفلاين 💻',
    hi: 'डाउनलोड करें और ऑफ़लाइन काम करें 💻',
    bn: 'ডাউনলোড এবং অফলাইনে কাজ করুন 💻',
    tl: 'I-download at Mag-offline 💻',
    ur: 'ڈাউন لوڈ اور آف لائن کام کریں 💻'
  },
  btn_manage_products: {
    ar: 'إدارة السلع والمخزون 📦',
    hi: 'सामान और इन्वेंटरी प्रबंधित करें 📦',
    bn: 'পণ্য এবং ইনভেন্টরি পরিচালনা করুন 📦',
    tl: 'Pamahalaan ang mga Produkto at Imbentaryo 📦',
    ur: 'اشیاء اور انوینٹری کا انتظام 📦'
  },
  btn_order_history: {
    ar: 'سجل الفواتير والمبيعات 🕒',
    hi: 'बिक्री और बिल इतिहास 🕒',
    bn: 'বিক্রয় এবং বিলের ইতিহাস 🕒',
    tl: 'Kasaysayan ng Benta at Resibo 🕒',
    ur: 'سیلز اور بل کی ہسٹری 🕒'
  },
  btn_devices: {
    ar: 'إدارة الأجهزة ⚙️',
    hi: 'डिवाइस प्रबंधन ⚙️',
    bn: 'ডিভাইस পরিচালনা ⚙️',
    tl: 'Pamahalaan ang mga Device ⚙️',
    ur: 'ڈیوائس کا انتظام ⚙️'
  },

  // Search & Catalog Filter
  search_placeholder: {
    ar: 'البحث عن سلعة بالاسم أو بالباركود...',
    hi: 'नाम या बारकोड से उत्पाद खोजें...',
    bn: 'নাম বা বারকোড দিয়ে পণ্য খুঁজুন...',
    tl: 'Maghanap ng produkto sa ngalan o barcode...',
    ur: 'نام یا بارکوڈ سے مصنوعات تلاش کریں...'
  },
  low_stock_filter: {
    ar: 'عرض السلع منخفضة الكمية فقط (< 5 حبات)',
    hi: 'केवल कम स्टॉक वाले उत्पाद दिखाएं (< 5 पीस)',
    bn: 'শুধুমাত্র কম স্টক থাকা পণ্যগুলি দেখান (< ৫ পিস)',
    tl: 'Ipakita lamang ang mababa ang stock (< 5 piraso)',
    ur: 'صرف کم اسٹاک والی اشیاء دکھائیں (< 5 دانے)'
  },
  no_products_found: {
    ar: 'لم يتم العثور على سلع مطابقة للبحث.',
    hi: 'खोज के लिए कोई उत्पाद नहीं मिला।',
    bn: 'অনুসন্ধানের জন্য কোনো পণ্য পাওয়া যায়নি।',
    tl: 'Walang nahanap na katugmang produkto.',
    ur: 'تلاش کے لیے کوئی چیز नहीं मिली।'
  },

  // Cart Section
  cart_title: {
    ar: 'عربة التسوق',
    hi: 'शॉपिंग कार्ट',
    bn: 'শপিং কার্ট',
    tl: 'Shopping Cart',
    ur: 'شاپنگ کارٹ'
  },
  cart_empty: {
    ar: 'العربة فارغة، مرر الباركود أو اختر سلعة للبدء',
    hi: 'कार्ट खाली है, शुरू करने के लिए बारकोड स्कैन करें या उत्पाद चुनें',
    bn: 'কার্ট খালি আছে, শুরু করতে বারকোড স্ক্যান করুন বা পণ্য নির্বাচন করুন',
    tl: 'Walang laman ang cart, i-scan ang barcode o pumili ng produkto upang magsimula',
    ur: 'کارٹ خالی ہے، شروع کرنے کے لیے بارکوڈ اسکین کریں یا کوئی چیز منتخب کریں'
  },
  barcode_input_placeholder: {
    ar: 'مرر الباركود أو اكتب يدوياً...',
    hi: 'बारकोड स्कैन करें या मैन्युअल रूप से दर्ज करें...',
    bn: 'বারকোड স্ক্যান করুন বা ম্যানুয়ালি লিখুন...',
    tl: 'I-scan ang barcode o i-type nang manu-mano...',
    ur: 'بارکوڈ اسکین کریں یا دستی طور پر درج کریں...'
  },
  btn_clear_cart: {
    ar: 'تفريغ العربة',
    hi: 'कार्ट खाली करें',
    bn: 'কার্ট খালি করুন',
    tl: 'I-clear ang Cart',
    ur: 'کارٹ خالی کریں'
  },

  // Cart Pricing & Checkout Summary
  subtotal: {
    ar: 'المجموع الفرعي',
    hi: 'उप-योग',
    bn: 'উপ-মোট',
    tl: 'Subtotal',
    ur: 'ذیلی کل'
  },
  subtotal_no_vat: {
    ar: 'المجموع الفرعي (غير شامل الضريبة)',
    hi: 'उप-योग (बिना टैक्स)',
    bn: 'উপ-মোট (ট্যাক্স ব্যতীত)',
    tl: 'Subtotal (Walang Tax)',
    ur: 'ذیلی کل (بغیر ٹیکس)'
  },
  discount: {
    ar: 'الخصم',
    hi: 'छूट',
    bn: 'ছাড়',
    tl: 'Diskwento',
    ur: 'رعایت'
  },
  vat: {
    ar: 'ضريبة القيمة المضافة (15%)',
    hi: 'मूल्य वर्धित कर (वैत 15%)',
    bn: 'ভ্যাট (১৫%)',
    tl: 'Value Added Tax (15% VAT)',
    ur: 'ویلیو ایڈڈ ٹیکس (15٪ واٹ)'
  },
  total: {
    ar: 'الإجمالي الكلي',
    hi: 'कुल योग',
    bn: 'সর্বমোট',
    tl: 'Kabuuang Halaga',
    ur: 'کل رقم'
  },
  total_with_vat: {
    ar: 'الإجمالي الكلي (شامل الضريبة)',
    hi: 'कुल योग (टैक्स सहित)',
    bn: 'সর্বমোট (ট্যাক্স সহ)',
    tl: 'Kabuuang Halaga (Kasama ang Tax)',
    ur: 'کل رقم (ٹیکس سمیت)'
  },
  sar_currency: {
    ar: 'ر.س',
    hi: 'SAR',
    bn: 'SAR',
    tl: 'SAR',
    ur: 'سعودی ریال'
  },
  btn_pay: {
    ar: 'الدفع والبيع 💸',
    hi: 'भुगतान करें 💸',
    bn: 'পেমেন্ট করুন 💸',
    tl: 'Magbayad 💸',
    ur: 'ادائیگی کریں 💸'
  },

  // Payment Terminal & Method Selection
  select_payment: {
    ar: 'اختر طريقة الدفع:',
    hi: 'भुगतान का तरीका चुनें:',
    bn: 'পেমেন্ট পদ্ধতি নির্বাচন করুন:',
    tl: 'Pumili ng Paraan ng Pagbabayad:',
    ur: 'ادائیگی کا طریقہ منتخب کریں:'
  },
  payment_cash: {
    ar: 'نقداً',
    hi: 'नकद',
    bn: 'নগদ',
    tl: 'Cash',
    ur: 'نقد'
  },
  payment_mada: {
    ar: 'مدى (دفع إلكتروني)',
    hi: 'मादा (Mada कार्ड)',
    bn: 'মাদা কার্ড',
    tl: 'Mada Card',
    ur: 'مدى کارڈ'
  },
  payment_visa: {
    ar: 'فيزا (دفع إلكتروني)',
    hi: 'वीज़ा (Visa)',
    bn: 'ভিসা কার্ড',
    tl: 'Visa Card',
    ur: 'ویزا کارڈ'
  },
  payment_apple_pay: {
    ar: 'أبل باي (دفع إلكتروني)',
    hi: 'एप्पल पे (Apple Pay)',
    bn: 'অ্যাপল পে',
    tl: 'Apple Pay',
    ur: 'ایپل پے'
  },
  received_amount: {
    ar: 'المبلغ المستلم',
    hi: 'प्राप्त राशि',
    bn: 'গৃহীত অর্থ',
    tl: 'Halagang Natanggap',
    ur: 'وصول شدہ رقم'
  },
  change_amount: {
    ar: 'المتبقي (المسترجع)',
    hi: 'बकाया राशि',
    bn: 'ফেরতযোগ্য অর্থ',
    tl: 'Sukli',
    ur: 'بقایا رقم'
  },
  enter_cash_received: {
    ar: 'أدخل المبلغ المستلم من العميل...',
    hi: 'ग्राहक से मिली राशि दर्ज करें...',
    bn: 'গ্রাহকের কাছ থেকে প্রাপ্ত অর্থ লিখুন...',
    tl: 'Ipasok ang halagang natanggap mula sa customer...',
    ur: 'صارف سے موصولہ رقم درج کریں...'
  },
  pay_now: {
    ar: 'تأكيد الدفع والطباعة 💸',
    hi: 'भुगतान की पुष्टि करें और प्रिंट करें 💸',
    bn: 'পেমেন্ট নিশ্চিত করুন এবং প্রিন্ট করুন 💸',
    tl: 'Kumpirmahin ang Bayad at I-print 💸',
    ur: 'ادائیگی کی تصدیق اور پرنٹ کریں 💸'
  },

  // Inventory list items details
  stock_prefix: {
    ar: 'المخزون:',
    hi: 'स्टॉक:',
    bn: 'স্টক:',
    tl: 'Imbentaryo:',
    ur: 'اسٹاک:'
  },
  items_unit: {
    ar: 'حبة',
    hi: 'पीस',
    bn: 'পিস',
    tl: 'piraso',
    ur: 'دانے'
  },
  out_of_stock: {
    ar: 'نفدت الكمية ⚠️',
    hi: 'स्टॉक खत्म ⚠️',
    bn: 'স্টক শেষ ⚠️',
    tl: 'Ubos ang stock ⚠️',
    ur: 'اسٹاک ختم ⚠️'
  },

  // Receipt Modal
  receipt_title: {
    ar: 'فاتورة البيع المبسطة',
    hi: 'सरलीकृत बिक्री चालान',
    bn: 'সাধারণ বিক্রয় রসিদ',
    tl: 'Pinasimpleng Resibo ng Benta',
    ur: 'سادہ سیلز بل'
  },
  btn_download_txt: {
    ar: 'تحميل الفاتورة (TXT)',
    hi: 'रसीद डाउनलोड करें (TXT)',
    bn: 'রসিদ ডাউনলোড করুন (TXT)',
    tl: 'I-download ang Resibo (TXT)',
    ur: 'بل ڈاؤن لوڈ کریں (TXT)'
  },
  btn_print: {
    ar: 'طباعة (Print)',
    hi: 'प्रिंट करें (Print)',
    bn: 'প্রিন্ট করুন (Print)',
    tl: 'I-print (Print)',
    ur: 'پرنٹ کریں (Print)'
  },
  invoice_number: {
    ar: 'رقم الفاتورة',
    hi: 'बिल संख्या',
    bn: 'রসিদ নম্বর',
    tl: 'Numero ng Resibo',
    ur: 'بل نمبر'
  },
  invoice_date: {
    ar: 'التاريخ',
    hi: 'दिनांक',
    bn: 'তারিখ',
    tl: 'Petsa',
    ur: 'تاریخ'
  },
  invoice_time: {
    ar: 'الوقت',
    hi: 'समय',
    bn: 'समय',
    tl: 'Oras',
    ur: 'وقت'
  },
  invoice_cashier: {
    ar: 'الكاشير',
    hi: 'कैशियर',
    bn: 'ক্যাপ্টেন',
    tl: 'Cashier',
    ur: 'کیشیئر'
  },
  invoice_cashier_name: {
    ar: 'أبو فهد (رئيسي)',
    hi: 'अबू फहद (मुख्य)',
    bn: 'আবু ফাহাদ (প্রধান)',
    tl: 'Abu Fahad (Pangunahing)',
    ur: 'ابو فہد (مین)'
  },
  invoice_status: {
    ar: 'حالة الدفع',
    hi: 'भुगतान स्थिति',
    bn: 'পেমেন্ট অবস্থা',
    tl: 'Katayuan ng Bayad',
    ur: 'ادائیگی کی حالت'
  },
  invoice_status_paid: {
    ar: 'مقبول / ناجح',
    hi: 'सफल / स्वीकृत',
    bn: 'সফল / গৃহীত',
    tl: 'Tanggap / Tagumpay',
    ur: 'کامیاب / منظور شدہ'
  },
  invoice_footer_msg1: {
    ar: 'فاتورة ضريبية مبسطة طبقا لهيئة الزكاة والضريبة والجمارك',
    hi: 'ज़कात, टैक्स और सीमा शुल्क प्राधिकरण के नियमों के तहत सरलीकृत टैक्स इनवॉइस',
    bn: 'যাকাত, ট্যাক্স এবং শুল্ক কর্তৃপক্ষের নিয়ম অনুযায়ী সাধারণ ট্যাক্স রসিদ',
    tl: 'Pinasimpleng Tax Invoice ayon sa regulasyon ng Zakat, Tax at Customs Authority',
    ur: 'زکوٰۃ، ٹیکس اور کسٹمز اتھارٹی کے قوانین کے تحت سادہ ٹیکس رسید'
  },
  invoice_footer_msg2: {
    ar: 'نشكركم لتسوقكم معنا!',
    hi: 'हमारे साथ खरीदारी करने के लिए धन्यवाद!',
    bn: 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!',
    tl: 'Salamat sa pamimili sa amin!',
    ur: 'ہمارے ساتھ خریداری کرنے کا شکریہ!'
  },
  invoice_footer_msg3: {
    ar: 'تُستبدل وتُسترجع البضائع خلال ٣ أيام بشرط حالتها الأصلية',
    hi: 'मूल स्थिति में होने पर सामान को 3 दिनों के भीतर बदला या वापस किया जा सकता है',
    bn: 'মূল অবস্থায় থাকলে ৩ দিনের মধ্যে পণ্য পরিবর্তন বা ফেরত দেওয়া যাবে',
    tl: 'Maaaring palitan o ibalik ang mga produkto sa loob ng 3 araw kung nasa orihinal na kondisyon',
    ur: 'اصل حالت میں ہونے کی صورت میں 3 دن کے اندر اشیاء تبدیل یا واپس کی جا سکتی ہیں'
  },

  // Toasts
  toast_order_success_msg: {
    ar: 'تم البيع بنجاح! رقم الفاتورة ',
    hi: 'बिक्री सफल रही! बिल संख्या ',
    bn: 'বিক্রয় সফল হয়েছে! রসিদ নম্বর ',
    tl: 'Matagumpay ang benta! Numero ng resibo ',
    ur: 'فروخت کامیاب رہی! بل نمبر '
  },
  toast_product_added_msg: {
    ar: 'تم تسجيل السلعة بنجاح في المخزن!',
    hi: 'उत्पाद को इन्वेंटरी में सफलतापूर्वक जोड़ा गया!',
    bn: 'পণ্যটি ইনভেন্টরিতে সফলভাবে যোগ করা হয়েছে!',
    tl: 'Matagumpay na naidagdag ang produkto sa imbentaryo!',
    ur: 'انوینٹری میں چیز کامیابی کے ساتھ شامل کر دی گئی!'
  },
  toast_product_updated_msg: {
    ar: 'تم حفظ تعديلات السلعة ',
    hi: 'उत्पाद में बदलाव सहेजे गए ',
    bn: 'পণ্যের পরিবর্তনগুলি সংরক্ষণ করা হয়েছে ',
    tl: 'Nai-save ang mga pagbabago sa produkto ',
    ur: 'تبدیلیاں کامیابی کے ساتھ محفوظ ہو گئیں '
  },
  toast_product_deleted_msg: {
    ar: 'تم حذف السلعة نهائياً من الرفوف.',
    hi: 'उत्पाद को अलमारियों से स्थायी रूप से हटा दिया गया है।',
    bn: 'পণ্যটি স্থায়ীভাবে তাক থেকে মুছে ফেলা হয়েছে।',
    tl: 'Permanenteng tinanggal ang produkto sa estante.',
    ur: 'چیز کو شیلف سے مستقل طور पर हटा दिया गया है।'
  },
  toast_refund_success_msg: {
    ar: 'تم إرجاع الفاتورة بنجاح وإعادة البضائع للمخزون.',
    hi: 'बिल रिफंड सफल रहा और सामान वापस इन्वेंटरी में जोड़ दिया गया।',
    bn: 'রসিদ রিফান্ড সফল হয়েছে এবং পণ্য ফেরত ইনভেন্টরিতে যোগ করা হয়েছে।',
    tl: 'Matagumpay na na-refund ang resibo at naibalik ang produkto sa imbentaryo.',
    ur: 'بل ریفنڈ ہو گیا اور اشیاء واپس انوینٹری میں چلی گئیں۔'
  }
};

// Maps for Categories Translations
export const CATEGORY_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'الكل': {
    ar: 'الكل',
    hi: 'सभी (All)',
    bn: 'সব (All)',
    tl: 'Lahat (All)',
    ur: 'سب (All)'
  },
  'الألبان والأجبان': {
    ar: 'الألبان والأجبان',
    hi: 'डेयरी और पनीर',
    bn: 'দুগ্ধ ও পনির',
    tl: 'Gatas at Keso',
    ur: 'ڈیری اور پنیر'
  },
  'المشروبات': {
    ar: 'المشروبات',
    hi: 'पेय पदार्थ',
    bn: 'পানীয়',
    tl: 'Mga Inumin',
    ur: 'مشروبات'
  },
  'المخبوزات': {
    ar: 'المخبوزات',
    hi: 'बेकरी',
    bn: 'বেকারি',
    tl: 'Bakery',
    ur: 'بیکری'
  },
  'المعلبات': {
    ar: 'المعلبات',
    hi: 'डिब्बाबند खाना',
    bn: 'ক্যানড ফুড',
    tl: 'Delata',
    ur: 'ڈبہ بند اشیاء'
  },
  'الخضار والفواكه': {
    ar: 'الخضار والفواكه',
    hi: 'फल और सब्जियां',
    bn: 'ফল ও শাকসবজি',
    tl: 'Prutas at Gulay',
    ur: 'پھل اور سبزیاں'
  },
  'السكاكر والحلويات': {
    ar: 'السكاكر والحلويات',
    hi: 'मीठा और टॉफ़ी',
    bn: 'মিষ্টি ও চকলেট',
    tl: 'Matatamis',
    ur: 'مٹھائیاں اور چاکلیٹ'
  },
  'مواد التنظيف': {
    ar: 'مواد التنظيف',
    hi: 'सफाई की चीजें',
    bn: 'পরিষ্কারের সামগ্রী',
    tl: 'Mga Panlinis',
    ur: 'صفائی کا سامان'
  },
  'أخرى': {
    ar: 'أخرى',
    hi: 'अन्य (Others)',
    bn: 'অন্যান্য (Others)',
    tl: 'Iba pa (Others)',
    ur: 'دیگر (Others)'
  }
};

// Maps for Default Products Translation
export const PRODUCT_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'حليب المراعي كامل الدسم 1 لتر': {
    ar: 'حليب المراعي كامل الدسم 1 لتر',
    hi: 'अलमराई फुल फैट मिल्क 1 लीटर',
    bn: 'আলমারাই ফুল ফ্যাট দুধ ১ লিটার',
    tl: 'Almarai Full Fat Milk 1 Liter',
    ur: 'المراعي فل فیٹ دودھ 1 لیٹر'
  },
  'خبز صامولي هرفي 6 حبات': {
    ar: 'خبز صامولي هرفي 6 حبات',
    hi: 'हर्फी समोली ब्रेड 6 पीस',
    bn: 'হারফি সামোলি রুটি ৬ পিস',
    tl: 'Herfy Samoli Bread 6 Pieces',
    ur: 'ہرفی صامولی روٹی 6 ٹکڑے'
  },
  'مياه نوفا صحية 330 مل': {
    ar: 'مياه نوفا صحية 330 مل',
    hi: 'नोवा मिनरल वाटर 330 मिली',
    bn: 'নোভา মিনারেল ওয়াটার ৩৩০ মিলি',
    tl: 'Nova Mineral Water 330 ml',
    ur: 'نووا منرل واٹر 330 ملی لیٹر'
  },
  'جبنة كرافت شيدر علبة 100غ': {
    ar: 'جبنة كرافت شيدر علبة 100غ',
    hi: 'क्राफ्ट चेडर चीज़ 100 ग्राम',
    bn: 'ক্রাফট চেডার পনির ১০০ গ্রাম',
    tl: 'Kraft Cheddar Cheese 100g',
    ur: 'کرافٹ چیڈر پنیر 100 گرام'
  },
  'زبادي المراعي طازج 170غ': {
    ar: 'زبادي المراعي طازج 170غ',
    hi: 'अलमराई ताजा दही 170 ग्राम',
    bn: 'আলমারাই ফ্রেশ দই ১৭০ গ্রাম',
    tl: 'Almarai Fresh Yogurt 170g',
    ur: 'المراعي تازہ دہی 170 گرام'
  },
  'عصير ربيع برتقال 250 مل': {
    ar: 'عصير ربيع برتقال 250 مل',
    hi: 'रबीज संतरे का जूस 250 मिली',
    bn: 'রাবিস কমলার জুস ২৫০ মিলি',
    tl: 'Rabea Orange Juice 250 ml',
    ur: 'ربیع مالٹے کا جوس 250 ملی لیٹر'
  },
  'أرز بسمتي الشعلان 5 كجم': {
    ar: 'أرز بسمتي الشعلان 5 كجم',
    hi: 'अल शालान बासमती चावल 5 किलो',
    bn: 'আল শালান বাসমতি চাল ৫ কেজি',
    tl: 'Al Shalan Basmati Rice 5 kg',
    ur: 'الشعلان باسمتی چاول 5 کلو'
  },
  'كوكا كولا علبة 325 مل': {
    ar: 'كوكا كولا علبة 325 مل',
    hi: 'कोका कोला कैन 325 मिली',
    bn: 'কোকা কোলা ক্যান ৩২৫ মিলি',
    tl: 'Coca Cola Can 325 ml',
    ur: 'کوکا کولا کین 325 ملی لیٹر'
  },
  'شيبس ليز بالملح عائلي': {
    ar: 'شيبس ليز بالملح عائلي',
    hi: 'लेज साल्टेड चिप्स फैमिली पैक',
    bn: 'লেস সল্টেড চিপস ফ্যামিলি প্যাক',
    tl: 'Lays Salted Chips Family Pack',
    ur: 'لیز نمکین چپس فیملی پیک'
  },
  'طبق بيض طازج 30 حبة': {
    ar: 'طبق بيض طازج 30 حبة',
    hi: 'ताजा अंडा ट्रे 30 पीस',
    bn: 'ডিমের ট্রে ৩০ পিস',
    tl: 'Fresh Egg Tray 30 Pieces',
    ur: 'تازہ انڈوں کی ٹرے 30 دانے'
  },
  'مسحوق غسيل تايد 1.5 كجم': {
    ar: 'مسحوق غسيل تايد 1.5 كجم',
    hi: 'टाइड डिटर्जेंट पाउडर 1.5 किलो',
    bn: 'টাইড ডিটারজেন্ট পাউডার ১.৫ কেজি',
    tl: 'Tide Washing Powder 1.5 kg',
    ur: 'ٹائڈ واشنگ پاؤڈر 1.5 کلو'
  },
  'زيت عافية ذرة طهي 1.5 لتر': {
    ar: 'زيت عافية ذرة طهي 1.5 لتر',
    hi: 'आफिया कॉर्न कुकिंग ऑयल 1.5 लीटर',
    bn: 'আফিয়া কর্ন কুকিং অয়েল ১.৫ লিটার',
    tl: 'Afia Corn Cooking Oil 1.5 Liter',
    ur: 'عافیہ مکئی کا تیل 1.5 لیٹر'
  },
  'تفاح أحمر سكري 1 كجم': {
    ar: 'تفاح أحمر سكري 1 كجم',
    hi: 'लाल सेब 1 किलो',
    bn: 'লাল আপেল ১ কেজি',
    tl: 'Red Apple 1 kg',
    ur: 'سرخ میٹھے سیب 1 کلو'
  },
  'طماطم بلدي طازج 1 كجم': {
    ar: 'طماطم بلدي طازج 1 كجم',
    hi: 'ताजा टमाटर 1 किलो',
    bn: 'তাজা টমেটো ১ কেজি',
    tl: 'Fresh Tomato 1 kg',
    ur: 'تازہ ٹماٹر 1 کلو'
  }
};

/**
 * Translates a key based on the current active language.
 */
export function t(key: string, lang: LanguageCode, fallback?: string): string {
  const translations = TRANSLATIONS[key];
  if (translations && translations[lang]) {
    return translations[lang];
  }
  return fallback || key;
}

/**
 * Translates product name if matches predefined dictionary.
 */
export function translateProduct(name: string, lang: LanguageCode): string {
  if (lang === 'ar') return name;
  const item = PRODUCT_TRANSLATIONS[name];
  if (item && item[lang]) {
    return item[lang];
  }
  return name;
}

/**
 * Translates category name if matches predefined dictionary.
 */
export function translateCategory(category: string, lang: LanguageCode): string {
  const item = CATEGORY_TRANSLATIONS[category];
  if (item && item[lang]) {
    return item[lang];
  }
  return category;
}
