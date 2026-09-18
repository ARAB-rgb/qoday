/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'ar' | 'en' | 'ur' | 'hi' | 'bn' | 'tl';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Filipino', flag: '🇵🇭', dir: 'ltr' }
];

export const TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // App Header & Branding
  app_title: {
    ar: 'قيد - كاشير ونقاط بيع ذكية',
    en: 'QAYD - Smart POS & Cashier System',
    ur: 'قید - اسمارٹ کیشیئر اور پوائنٹ آف سیل',
    hi: 'क़ैद - स्मार्ट पीओएस और कैशियर सिस्टम',
    bn: 'কায়দ - স্মার্ট পিওএস এবং ক্যাশিয়ার সিস্টেম',
    tl: 'QAYD - Smart POS at Cashier System'
  },
  app_subtitle: {
    ar: 'نظام كاشير قيد (QAYD) المتكامل والسريع المتوافق مع هيئة الزكاة والضريبة والجمارك',
    en: 'QAYD Integrated POS System compliant with ZATCA regulations',
    ur: 'زکوٰۃ اور ٹیکس اتھارٹی (ZATCA) کے قوانین کے مطابق تیز رفتار پی او ایس',
    hi: 'ज़कात और टैक्स अथॉरिटी के नियमों के अनुरूप तेज़ पीओएस सिस्टम',
    bn: 'যাকাত ও ট্যাক্স কর্তৃপক্ষের নিয়ম মেনে দ্রুত পিওএস সিস্টেম',
    tl: 'Mabilis na POS System na sumusunod sa mga regulasyon ng ZATCA'
  },
  pos_smart_badge: {
    ar: 'نقطة بيع ذكية',
    en: 'Smart POS',
    ur: 'اسمارٹ پی او ایس',
    hi: 'स्मार्ट पीओएस',
    bn: 'স্মার্ট পিওএস',
    tl: 'Smart POS'
  },
  active_company_sub: {
    ar: 'المؤسسة والاشتراك النشط 🏢',
    en: 'Active Company & Subscription 🏢',
    ur: 'فعال کمپنی اور سبسکرپشن 🏢',
    hi: 'सक्रिय कंपनी और सदस्यता 🏢',
    bn: 'সক্রিয় প্রতিষ্ঠান ও সাবস্ক্রিপশন 🏢',
    tl: 'Aktibong Kumpanya at Subscription 🏢'
  },
  users_and_subscribers: {
    ar: 'المستخدمين والمشتركين 🛡️',
    en: 'Users & Subscribers 🛡️',
    ur: 'صارفین اور سبسکرائبرز 🛡️',
    hi: 'उपयोगकर्ता और सदस्य 🛡️',
    bn: 'ব্যবহারকারী এবং সদস্য 🛡️',
    tl: 'Mga Gumagamit at Subscriber 🛡️'
  },
  user_profile_btn: {
    ar: 'صفحة المستخدم 👤',
    en: 'User Profile 👤',
    ur: 'صارف پروفائل 👤',
    hi: 'उपयोगकर्ता प्रोफ़ाइल 👤',
    bn: 'ব্যবহারকারীর প্রোফাইল 👤',
    tl: 'Profile ng Gumagamit 👤'
  },
  daily_sales: {
    ar: 'إيراد اليوم',
    en: 'Daily Sales',
    ur: 'آج کی آمدنی',
    hi: 'आज की बिक्री',
    bn: 'আজকের বিক্রি',
    tl: 'Benta Ngayong Araw'
  },
  cashier_settings: {
    ar: 'إعدادات الكاشير',
    en: 'Cashier Settings',
    ur: 'کیشیئر سیٹنگز',
    hi: 'कैशियर सेटिंग्स',
    bn: 'ক্যাশিয়ার সেটিংস',
    tl: 'Mga Setting ng Cashier'
  },
  camera_scan: {
    ar: 'مسح بالكاميرا',
    en: 'Camera Scan',
    ur: 'کیمرہ اسکین',
    hi: 'कैमरा स्कैन',
    bn: 'ক্যামেরা স্ক্যান',
    tl: 'I-scan sa Camera'
  },
  btn_offline: {
    ar: 'التحميل والعمل أوفلاين 💻',
    en: 'Offline Mode & Download 💻',
    ur: 'ڈاؤن لوڈ اور آف لائن کام 💻',
    hi: 'डाउनलोड करें और ऑफ़लाइन काम करें 💻',
    bn: 'ডাউনলোড এবং অফলাইন মোড 💻',
    tl: 'Offline Mode at Pag-download 💻'
  },
  btn_manage_products: {
    ar: 'إدارة السلع والمخزون 📦',
    en: 'Products & Inventory 📦',
    ur: 'اشیاء اور انوینٹری کا انتظام 📦',
    hi: 'सामान और इन्वेंटरी प्रबंधित करें 📦',
    bn: 'পণ্য এবং ইনভেন্টরি পরিচালনা 📦',
    tl: 'Pamahalaan ang Imbentaryo 📦'
  },
  btn_order_history: {
    ar: 'سجل الفواتير والمبيعات 🕒',
    en: 'Orders & Sales History 🕒',
    ur: 'سیلز اور بل کی ہسٹری 🕒',
    hi: 'बिक्री और बिल इतिहास 🕒',
    bn: 'বিক্রয় এবং বিলের ইতিহাস 🕒',
    tl: 'Kasaysayan ng mga Benta 🕒'
  },
  btn_devices: {
    ar: 'إدارة الأجهزة ⚙️',
    en: 'Device Management ⚙️',
    ur: 'ڈیوائس کا انتظام ⚙️',
    hi: 'डिवाइस प्रबंधन ⚙️',
    bn: 'ডিভাইস পরিচালনা ⚙️',
    tl: 'Pamahalaan ang mga Device ⚙️'
  },

  // Grocery & Store defaults
  grocery_subtitle: {
    ar: 'للمواد الغذائية والاستهلاكية',
    en: 'Foodstuffs & Consumer Goods',
    ur: 'غذائی اور اشیائے صرف',
    hi: 'खाद्य और उपभोक्ता सामान',
    bn: 'খাদ্য এবং ভোক্তা পণ্য',
    tl: 'Mga Pagkain at Consumer Goods'
  },
  grocery_address: {
    ar: 'شارع الأمير محمد بن عبدالعزيز، الرياض',
    en: 'Prince Muhammad Bin Abdulaziz St, Riyadh',
    ur: 'پرنس محمد بن عبدالعزیز اسٹریٹ، ریاض',
    hi: 'प्रिंस मुहम्मद बिन अब्दुलअज़ीज़ स्ट्रीट, रियाद',
    bn: 'প্রিন্স মুহাম্মদ বিন আবদুল আজিজ স্ট্রিট, রিয়াদ',
    tl: 'Prince Muhammad Bin Abdulaziz St, Riyadh'
  },
  grocery_phone: {
    ar: 'جوال: 0556446888',
    en: 'Mob: 0556446888',
    ur: 'موبائل: 0556446888',
    hi: 'मोबाइल: 0556446888',
    bn: 'মোবাইল: 0556446888',
    tl: 'Mob: 0556446888'
  },
  vat_number_label: {
    ar: 'الرقم الضريبي',
    en: 'VAT Number',
    ur: 'ٹیکس نمبر (VAT)',
    hi: 'टैक्स संख्या (VAT)',
    bn: 'ভ্যাট নম্বর (VAT)',
    tl: 'VAT Number'
  },
  cr_number_label: {
    ar: 'السجل التجاري',
    en: 'Commercial Registry (CR)',
    ur: 'کمرشل رجسٹریشن',
    hi: 'व्यावसायिक पंजीकरण (CR)',
    bn: 'বাণিজ্যিক নিবন্ধন (CR)',
    tl: 'Commercial Registration (CR)'
  },

  // Catalog Section
  catalog_title: {
    ar: 'كتالوج السلع والمنتجات',
    en: 'Product Catalog & Inventory',
    ur: 'پروڈکٹ کیٹلاگ اور انوینٹری',
    hi: 'उत्पाद कैटलॉग और इन्वेंटरी',
    bn: 'পণ্য ক্যাটালগ ও ইনভেন্টরি',
    tl: 'Katalogo ng mga Produkto'
  },
  search_placeholder: {
    ar: 'البحث عن سلعة بالاسم أو بالباركود...',
    en: 'Search product by name or barcode...',
    ur: 'نام یا بارکوڈ سے پروڈکٹ تلاش کریں...',
    hi: 'नाम या बारकोड से उत्पाद खोजें...',
    bn: 'নাম বা বারকোড দিয়ে পণ্য খুঁজুন...',
    tl: 'Maghanap ng produkto sa ngalan o barcode...'
  },
  low_stock_filter: {
    ar: 'عرض السلع منخفضة الكمية فقط (< 5 حبات)',
    en: 'Show low stock items only (< 5 units)',
    ur: 'صرف کم اسٹاک والی اشیاء دکھائیں (< 5 دانے)',
    hi: 'केवल कम स्टॉक वाले उत्पाद दिखाएं (< 5 पीस)',
    bn: 'শুধুমাত্র কম স্টক থাকা পণ্যগুলি দেখান (< ৫ পিস)',
    tl: 'Ipakita lamang ang mababa ang stock (< 5 piraso)'
  },
  no_products_found: {
    ar: 'لم يتم العثور على سلع مطابقة للبحث.',
    en: 'No matching products found.',
    ur: 'تلاش کے مطابق کوئی چیز نہیں ملی۔',
    hi: 'खोज के लिए कोई उत्पाद नहीं मिला।',
    bn: 'অনুসন্ধানের জন্য কোনো পণ্য পাওয়া যায়নি।',
    tl: 'Walang nahanap na katugmang produkto.'
  },
  cat_all: {
    ar: 'الكل',
    en: 'All',
    ur: 'سب',
    hi: 'सभी',
    bn: 'সব',
    tl: 'Lahat'
  },

  // Cart Section
  cart_title: {
    ar: 'عربة التسوق',
    en: 'Shopping Cart',
    ur: 'شاپنگ کارٹ',
    hi: 'शॉपिंग कार्ट',
    bn: 'শপিং কার্ট',
    tl: 'Shopping Cart'
  },
  cart_empty: {
    ar: 'العربة فارغة، مرر الباركود أو اختر سلعة للبدء',
    en: 'Cart is empty, scan barcode or tap item to start',
    ur: 'کارٹ خالی ہے، بارکوڈ اسکین کریں یا آئٹم منتخب کریں',
    hi: 'कार्ट खाली है, शुरू करने के लिए बारकोड स्कैन करें या उत्पाद चुनें',
    bn: 'কার্ট খালি আছে, শুরু করতে বারকোড স্ক্যান করুন বা পণ্য নির্বাচন করুন',
    tl: 'Walang laman ang cart, i-scan ang barcode o pumili ng produkto upang magsimula'
  },
  barcode_input_placeholder: {
    ar: 'مرر الباركود أو اكتب يدوياً...',
    en: 'Scan barcode or type manually...',
    ur: 'بارکوڈ اسکین کریں یا خود لکھیں...',
    hi: 'बारकोड स्कैन करें या मैन्युअल रूप से दर्ज करें...',
    bn: 'বারকোড স্ক্যান করুন বা টাইপ করুন...',
    tl: 'I-scan ang barcode o i-type nang manu-mano...'
  },
  btn_clear_cart: {
    ar: 'تفريغ العربة',
    en: 'Clear Cart',
    ur: 'کارٹ خالی کریں',
    hi: 'कार्ट खाली करें',
    bn: 'কার্ট খালি করুন',
    tl: 'I-clear ang Cart'
  },
  product_header: {
    ar: 'المنتج',
    en: 'Product',
    ur: 'پروڈکٹ',
    hi: 'उत्पाद (Product)',
    bn: 'পণ্য (Product)',
    tl: 'Produkto'
  },
  qty_header: {
    ar: 'الكمية',
    en: 'Qty',
    ur: 'مقدار',
    hi: 'मात्रा (Qty)',
    bn: 'পরিমাণ (Qty)',
    tl: 'Dami'
  },
  price_header: {
    ar: 'السعر',
    en: 'Price',
    ur: 'قیمت',
    hi: 'मूल्य (Price)',
    bn: 'মূল্য (Price)',
    tl: 'Presyo'
  },
  total_header: {
    ar: 'المجموع',
    en: 'Total',
    ur: 'ٹوٹل',
    hi: 'कुल (Total)',
    bn: 'মোট (Total)',
    tl: 'Kabuuan'
  },

  // Cart Pricing & Checkout Summary
  subtotal: {
    ar: 'المجموع الفرعي',
    en: 'Subtotal',
    ur: 'ذیلی کل',
    hi: 'उप-योग',
    bn: 'উপ-মোট',
    tl: 'Subtotal'
  },
  subtotal_no_vat: {
    ar: 'المجموع الفرعي (غير شامل الضريبة)',
    en: 'Subtotal (Excl. VAT)',
    ur: 'ذیلی کل (بغیر ٹیکس)',
    hi: 'उप-योग (बिना टैक्स)',
    bn: 'উপ-মোট (ট্যাক্স ব্যতীত)',
    tl: 'Subtotal (Walang Tax)'
  },
  discount: {
    ar: 'الخصم',
    en: 'Discount',
    ur: 'رعایت',
    hi: 'छूट',
    bn: 'ছাড়',
    tl: 'Diskwento'
  },
  vat: {
    ar: 'ضريبة القيمة المضافة (15%)',
    en: 'Value Added Tax (15% VAT)',
    ur: 'ویلیو ایڈڈ ٹیکس (15٪ واٹ)',
    hi: 'मूल्य वर्धित कर (वैत 15%)',
    bn: 'ভ্যাট (১৫%)',
    tl: 'Value Added Tax (15% VAT)'
  },
  total: {
    ar: 'الإجمالي الكلي',
    en: 'Grand Total',
    ur: 'کل رقم',
    hi: 'कुल योग',
    bn: 'সর্বমোট',
    tl: 'Kabuuang Halaga'
  },
  total_with_vat: {
    ar: 'الإجمالي الكلي (شامل الضريبة)',
    en: 'Total (Incl. VAT)',
    ur: 'کل رقم (ٹیکس سمیت)',
    hi: 'कुल योग (टैक्स सहित)',
    bn: 'সর্বমোট (ট্যাক্স সহ)',
    tl: 'Kabuuang Halaga (Kasama ang Tax)'
  },
  sar_currency: {
    ar: 'ر.س',
    en: 'SAR',
    ur: 'سعودی ریال',
    hi: 'SAR',
    bn: 'SAR',
    tl: 'SAR'
  },
  btn_pay: {
    ar: 'الدفع والبيع 💸',
    en: 'Checkout & Pay 💸',
    ur: 'ادائیگی اور فروخت 💸',
    hi: 'भुगतान करें 💸',
    bn: 'পেমেন্ট করুন 💸',
    tl: 'Magbayad 💸'
  },

  // Payment Terminal & Methods
  select_payment: {
    ar: 'اختر طريقة الدفع:',
    en: 'Select Payment Method:',
    ur: 'ادائیگی کا طریقہ منتخب کریں:',
    hi: 'भुगतान का तरीका चुनें:',
    bn: 'পেমেন্ট পদ্ধতি নির্বাচন করুন:',
    tl: 'Pumili ng Paraan ng Pagbabayad:'
  },
  payment_cash: {
    ar: 'نقداً',
    en: 'Cash',
    ur: 'نقد',
    hi: 'नकद',
    bn: 'নগদ',
    tl: 'Cash'
  },
  payment_mada: {
    ar: 'مدى (دفع إلكتروني)',
    en: 'Mada (Debit Card)',
    ur: 'مدى کارڈ',
    hi: 'मादा (Mada कार्ड)',
    bn: 'মাদা কার্ড',
    tl: 'Mada Card'
  },
  payment_visa: {
    ar: 'فيزا (دفع إلكتروني)',
    en: 'Visa (Credit Card)',
    ur: 'ویزا کارڈ',
    hi: 'वीज़ा (Visa)',
    bn: 'ভিসা কার্ড',
    tl: 'Visa Card'
  },
  payment_apple_pay: {
    ar: 'أبل باي (دفع إلكتروني)',
    en: 'Apple Pay',
    ur: 'ایپل پے',
    hi: 'एप्पल पे (Apple Pay)',
    bn: 'অ্যাপল পে',
    tl: 'Apple Pay'
  },
  received_amount: {
    ar: 'المبلغ المستلم',
    en: 'Received Amount',
    ur: 'وصول شدہ رقم',
    hi: 'प्राप्त राशि',
    bn: 'গৃহীত অর্থ',
    tl: 'Halagang Natanggap'
  },
  change_amount: {
    ar: 'المتبقي (المسترجع)',
    en: 'Change Due',
    ur: 'بقایا رقم',
    hi: 'बकाया राशि',
    bn: 'ফেরতযোগ্য অর্থ',
    tl: 'Sukli'
  },
  enter_cash_received: {
    ar: 'أدخل المبلغ المستلم من العميل...',
    en: 'Enter amount received from customer...',
    ur: 'کسٹمر سے وصول رقم درج کریں...',
    hi: 'ग्राहक से मिली राशि दर्ज करें...',
    bn: 'গ্রাহকের কাছ থেকে প্রাপ্ত অর্থ লিখুন...',
    tl: 'Ipasok ang halagang natanggap mula sa customer...'
  },
  pay_now: {
    ar: 'تأكيد الدفع والطباعة 💸',
    en: 'Confirm Payment & Print 💸',
    ur: 'ادائیگی کی تصدیق اور پرنٹ 💸',
    hi: 'भुगतान की पुष्टि करें और प्रिंट करें 💸',
    bn: 'পেমেন্ট নিশ্চিত করুন এবং প্রিন্ট করুন 💸',
    tl: 'Kumpirmahin ang Bayad at I-print 💸'
  },

  // Stock details
  stock_prefix: {
    ar: 'المخزون:',
    en: 'Stock:',
    ur: 'اسٹاک:',
    hi: 'स्टॉक:',
    bn: 'স্টক:',
    tl: 'Imbentaryo:'
  },
  items_unit: {
    ar: 'حبة',
    en: 'pcs',
    ur: 'دانے',
    hi: 'पीस',
    bn: 'পিস',
    tl: 'piraso'
  },
  out_of_stock: {
    ar: 'نفدت الكمية ⚠️',
    en: 'Out of Stock ⚠️',
    ur: 'اسٹاک ختم ⚠️',
    hi: 'स्टॉक खत्म ⚠️',
    bn: 'স্টক শেষ ⚠️',
    tl: 'Ubos ang stock ⚠️'
  },
  unavailable_badge: {
    ar: 'غير متوفر ❌',
    en: 'Unavailable ❌',
    ur: 'دستیاب نہیں ❌',
    hi: 'उपलब्ध नहीं ❌',
    bn: 'অনুপলব্ধ ❌',
    tl: 'Hindi Available ❌'
  },

  // Receipts and Invoices
  receipt_title: {
    ar: 'فاتورة البيع المبسطة',
    en: 'Simplified Tax Invoice',
    ur: 'سادہ سیلز بل',
    hi: 'सरलीकृत बिक्री चालान',
    bn: 'সাধারণ বিক্রয় রসিদ',
    tl: 'Pinasimpleng Resibo ng Benta'
  },
  btn_download_txt: {
    ar: 'تحميل الفاتورة (TXT)',
    en: 'Download Receipt (TXT)',
    ur: 'بل ڈاؤن لوڈ کریں (TXT)',
    hi: 'रसीद डाउनलोड करें (TXT)',
    bn: 'রসিদ ডাউনলোড করুন (TXT)',
    tl: 'I-download ang Resibo (TXT)'
  },
  btn_print: {
    ar: 'طباعة (Print)',
    en: 'Print',
    ur: 'پرنٹ کریں (Print)',
    hi: 'प्रिंट करें (Print)',
    bn: 'প্রিন্ট করুন (Print)',
    tl: 'I-print (Print)'
  },
  invoice_number: {
    ar: 'رقم الفاتورة',
    en: 'Invoice Number',
    ur: 'بل نمبر',
    hi: 'बिल संख्या',
    bn: 'রসিদ নম্বর',
    tl: 'Numero ng Resibo'
  },
  invoice_date: {
    ar: 'التاريخ',
    en: 'Date',
    ur: 'تاریخ',
    hi: 'दिनांक',
    bn: 'তারিখ',
    tl: 'Petsa'
  },
  invoice_time: {
    ar: 'الوقت',
    en: 'Time',
    ur: 'وقت',
    hi: 'समय',
    bn: 'সময়',
    tl: 'Oras'
  },
  invoice_cashier: {
    ar: 'الكاشير',
    en: 'Cashier',
    ur: 'کیشیئر',
    hi: 'कैशियर',
    bn: 'ক্যাশিয়ার',
    tl: 'Cashier'
  },
  invoice_cashier_name: {
    ar: 'أبو فهد (رئيسي)',
    en: 'Abu Fahad (Main)',
    ur: 'ابو فہد (مین)',
    hi: 'अबू फहद (मुख्य)',
    bn: 'আবু ফাহাদ (প্রধান)',
    tl: 'Abu Fahad (Main)'
  },
  invoice_status: {
    ar: 'حالة الدفع',
    en: 'Payment Status',
    ur: 'ادائیگی کی حالت',
    hi: 'भुगतान स्थिति',
    bn: 'পেমেন্ট অবস্থা',
    tl: 'Katayuan ng Bayad'
  },
  invoice_status_paid: {
    ar: 'مقبول / ناجح',
    en: 'Paid / Approved',
    ur: 'کامیاب / منظور شدہ',
    hi: 'सफल / स्वीकृत',
    bn: 'সফল / গৃহীত',
    tl: 'Tanggap / Tagumpay'
  },
  invoice_footer_msg1: {
    ar: 'فاتورة ضريبية مبسطة طبقا لهيئة الزكاة والضريبة والجمارك',
    en: 'Simplified Tax Invoice as per ZATCA regulations',
    ur: 'زکوٰۃ، ٹیکس اور کسٹمز اتھارٹی (ZATCA) کے مطابق سادہ ٹیکس بل',
    hi: 'ज़कात, टैक्स और सीमा शुल्क प्राधिकरण के नियमों के तहत सरलीकृत टैक्स इनवॉइस',
    bn: 'যাকাত, ট্যাক্স এবং শুল্ক কর্তৃপক্ষের নিয়ম অনুযায়ী সাধারণ ট্যাক্স রসিদ',
    tl: 'Pinasimpleng Tax Invoice ayon sa regulasyon ng ZATCA'
  },
  invoice_footer_msg2: {
    ar: 'نشكركم لتسوقكم معنا!',
    en: 'Thank you for shopping with us!',
    ur: 'ہمارے ساتھ خریداری کرنے کا شکریہ!',
    hi: 'हमारे साथ खरीदारी करने के लिए धन्यवाद!',
    bn: 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!',
    tl: 'Salamat sa pamimili sa amin!'
  },
  invoice_footer_msg3: {
    ar: 'تُستبدل وتُسترجع البضائع خلال ٣ أيام بشرط حالتها الأصلية',
    en: 'Items can be exchanged or returned within 3 days in original condition',
    ur: 'اصل حالت میں ہونے کی صورت میں 3 دن کے اندر اشیاء تبدیل یا واپس کی جا سکتی ہیں',
    hi: 'मूल स्थिति में होने पर सामान को 3 दिनों के भीतर बदला या वापस किया जा सकता है',
    bn: 'মূল অবস্থায় থাকলে ৩ দিনের মধ্যে পণ্য পরিবর্তন বা ফেরত দেওয়া যাবে',
    tl: 'Maaaring palitan o ibalik ang mga produkto sa loob ng 3 araw sa orihinal na kondisyon'
  },

  // Reports and Analytics
  report_sales_title: {
    ar: 'سجل المبيعات والتقارير المالية',
    en: 'Sales History & Financial Reports',
    ur: 'سیلز ہسٹری اور مالیاتی رپورٹس',
    hi: 'बिक्री इतिहास और वित्तीय रिपोर्ट',
    bn: 'বিক্রয় ইতিহাস এবং আর্থিক রিপোর্ট',
    tl: 'Kasaysayan ng Benta at mga Ulat'
  },
  report_shift_summary: {
    ar: 'تقرير مبيعات الوردية (Z-Report)',
    en: 'Shift Sales Summary Report (Z-Report)',
    ur: 'شفٹ سیلز خلاصہ رپورٹ (Z-Report)',
    hi: 'शिफ्ट बिक्री सारांश रिपोर्ट (Z-Report)',
    bn: 'শিফট বিক্রয় সারাংশ রিপোর্ট (Z-Report)',
    tl: 'Ulat ng Buod ng Benta ng Shift (Z-Report)'
  },
  report_total_sales: {
    ar: 'إجمالي المبيعات (شامل الضريبة)',
    en: 'Total Sales (Gross)',
    ur: 'کل فروخت (ٹیکس سمیت)',
    hi: 'कुल बिक्री (टैक्स सहित)',
    bn: 'মোট বিক্রি (ট্যাক্স সহ)',
    tl: 'Kabuuang Benta'
  },
  report_net_sales: {
    ar: 'صافي المبيعات (بدون الضريبة)',
    en: 'Net Sales (Excl. VAT)',
    ur: 'خالص فروخت (بغیر ٹیکس)',
    hi: 'शुद्ध बिक्री (बिना टैक्स)',
    bn: 'নিট বিক্রি (ট্যাক্স ব্যতীত)',
    tl: 'Netong Benta'
  },
  report_total_vat: {
    ar: 'ضريبة القيمة المضافة المحصلة (15%)',
    en: 'Collected VAT (15%)',
    ur: 'جمع شدہ ٹیکس (15٪ واٹ)',
    hi: 'एकत्रित मूल्य वर्धित कर (15%)',
    bn: 'সংগৃহীত ভ্যাট (১৫%)',
    tl: 'Nakolektang VAT (15%)'
  },
  report_total_orders: {
    ar: 'عدد الفواتير الصادرة',
    en: 'Total Orders Issued',
    ur: 'کل جاری کردہ بل',
    hi: 'जारी किए गए कुल बिल',
    bn: 'মোট ইস্যুকৃত রসিদ',
    tl: 'Kabuuang Bilang ng Resibo'
  },
  report_estimated_profit: {
    ar: 'صافي الأرباح التقريبية',
    en: 'Estimated Net Profit',
    ur: 'تخمینی خالص منافع',
    hi: 'अनुमानित शुद्ध लाभ',
    bn: 'আনুমানিক নিট লাভ',
    tl: 'Tinatayang Netong Tubo'
  },
  report_print_btn: {
    ar: 'طباعة تقرير المبيعات المزدوج 🖨️',
    en: 'Print Bilingual Sales Report 🖨️',
    ur: 'دو لسانی سیلز رپورٹ پرنٹ کریں 🖨️',
    hi: 'द्विभाषी बिक्री रिपोर्ट प्रिंट करें 🖨️',
    bn: 'দ্বিভাষিক বিক্রয় রিপোর্ট প্রিন্ট করুন 🖨️',
    tl: 'I-print ang Bilingual na Ulat 🖨️'
  },
  report_export_csv: {
    ar: 'تصدير المبيعات (Excel)',
    en: 'Export Sales (Excel)',
    ur: 'ایکسل میں ایکسپورٹ کریں',
    hi: 'एक्सेल में निर्यात करें',
    bn: 'এক্সেলে এক্সপোর্ট করুন',
    tl: 'I-export sa Excel'
  },
  report_date: {
    ar: 'تاريخ التقرير',
    en: 'Report Date',
    ur: 'رپورٹ کی تاریخ',
    hi: 'रिपोर्ट की तारीख',
    bn: 'রিপোর্টের তারিখ',
    tl: 'Petsa ng Ulat'
  },
  bilingual_printing_badge: {
    ar: 'الطباعة المزدوجة مفعلة: العربية أساسية دائماً',
    en: 'Bilingual Printing Active: Arabic is always primary',
    ur: 'دو لسانی پرنٹنگ فعال: عربی ہمیشہ بنیادی ہے',
    hi: 'द्विभाषी प्रिंटिंग सक्रिय: अरबी हमेशा मुख्य है',
    bn: 'দ্বিভাষিক প্রিন্টিং সক্রিয়: আরবি সর্বদা প্রধান',
    tl: 'Aktibo ang Bilingual Printing: Arabic ang laging una'
  },

  // Toasts
  toast_order_success_msg: {
    ar: 'تم البيع بنجاح! رقم الفاتورة ',
    en: 'Sale completed successfully! Invoice #',
    ur: 'فروخت کامیاب رہی! بل نمبر ',
    hi: 'बिक्री सफल रही! बिल संख्या ',
    bn: 'বিক্রয় সফল হয়েছে! রসিদ নম্বর ',
    tl: 'Matagumpay ang benta! Numero ng resibo '
  },
  toast_product_added_msg: {
    ar: 'تم تسجيل السلعة بنجاح في المخزن!',
    en: 'Product added to inventory successfully!',
    ur: 'انوینٹری میں چیز کامیابی کے ساتھ شامل کر دی گئی!',
    hi: 'उत्पाद को इन्वेंटरी में सफलतापूर्वक जोड़ा गया!',
    bn: 'পণ্যটি ইনভেন্টরিতে সফলভাবে যোগ করা হয়েছে!',
    tl: 'Matagumpay na naidagdag ang produkto sa imbentaryo!'
  },
  toast_product_updated_msg: {
    ar: 'تم حفظ تعديلات السلعة ',
    en: 'Product updated successfully ',
    ur: 'تبدیلیاں کامیابی کے ساتھ محفوظ ہو گئیں ',
    hi: 'उत्पाद में बदलाव सहेजे गए ',
    bn: 'পণ্যের পরিবর্তনগুলি সংরক্ষণ করা হয়েছে ',
    tl: 'Nai-save ang mga pagbabago sa produkto '
  },
  toast_product_deleted_msg: {
    ar: 'تم حذف السلعة نهائياً من الرفوف.',
    en: 'Product removed from shelves.',
    ur: 'چیز کو شیلف سے مستقل طور پر ہٹا دیا گیا۔',
    hi: 'उत्पाद को अलमारियों से स्थायी रूप से हटा दिया गया है।',
    bn: 'পণ্যটি স্থায়ীভাবে তাক থেকে মুছে ফেলা হয়েছে।',
    tl: 'Permanenteng tinanggal ang produkto sa estante.'
  },
  toast_refund_success_msg: {
    ar: 'تم إرجاع الفاتورة بنجاح وإعادة البضائع للمخزون.',
    en: 'Invoice refunded successfully and items returned to stock.',
    ur: 'بل ریفنڈ ہو گیا اور اشیاء واپس انوینٹری میں چلی گئیں۔',
    hi: 'बिल रिफंड सफल रहा और सामान वापस इन्वेंटरी में जोड़ दिया गया।',
    bn: 'রসিদ রিফান্ড সফল হয়েছে এবং পণ্য ফেরত ইনভেন্টরিতে যোগ করা হয়েছে।',
    tl: 'Matagumpay na na-refund ang resibo at naibalik ang produkto sa imbentaryo.'
  }
};

// Maps for Categories Translations
export const CATEGORY_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'الكل': {
    ar: 'الكل',
    en: 'All',
    ur: 'سب',
    hi: 'सभी (All)',
    bn: 'সব (All)',
    tl: 'Lahat (All)'
  },
  'الألبان والأجبان': {
    ar: 'الألبان والأجبان',
    en: 'Dairy & Cheese',
    ur: 'ڈیری اور پنیر',
    hi: 'डेयरी और पनीर',
    bn: 'দুগ্ধ ও পনির',
    tl: 'Gatas at Keso'
  },
  'المشروبات': {
    ar: 'المشروبات',
    en: 'Beverages & Drinks',
    ur: 'مشروبات',
    hi: 'पेय पदार्थ',
    bn: 'পানীয়',
    tl: 'Mga Inumin'
  },
  'المخبوزات': {
    ar: 'المخبوزات',
    en: 'Bakery & Bread',
    ur: 'بیکری',
    hi: 'बेकरी',
    bn: 'বেকারি',
    tl: 'Bakery'
  },
  'المعلبات': {
    ar: 'المعلبات',
    en: 'Canned Food',
    ur: 'ڈبہ بند اشیاء',
    hi: 'डिब्बाबंद खाना',
    bn: 'ক্যানড ফুড',
    tl: 'Delata'
  },
  'الخضار والفواكه': {
    ar: 'الخضار والفواكه',
    en: 'Fruits & Vegetables',
    ur: 'پھل اور سبزیاں',
    hi: 'फल और सब्जियां',
    bn: 'ফল ও শাকসবজি',
    tl: 'Prutas at Gulay'
  },
  'السكاكر والحلويات': {
    ar: 'السكاكر والحلويات',
    en: 'Sweets & Confectionery',
    ur: 'مٹھائیاں اور چاکلیٹ',
    hi: 'मीठा और टॉफ़ी',
    bn: 'মিষ্টি ও চকলেট',
    tl: 'Matatamis'
  },
  'مواد التنظيف': {
    ar: 'مواد التنظيف',
    en: 'Cleaning Supplies',
    ur: 'صفائی کا سامان',
    hi: 'सफाई की चीजें',
    bn: 'পরিষ্কারের সামগ্রী',
    tl: 'Mga Panlinis'
  },
  'أخرى': {
    ar: 'أخرى',
    en: 'Others',
    ur: 'دیگر',
    hi: 'अन्य (Others)',
    bn: 'অন্যান্য (Others)',
    tl: 'Iba pa (Others)'
  }
};

// Maps for Default Products Translation
export const PRODUCT_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'حليب المراعي كامل الدسم 1 لتر': {
    ar: 'حليب المراعي كامل الدسم 1 لتر',
    en: 'Almarai Full Fat Milk 1L',
    ur: 'المراعي فل فیٹ دودھ 1 لیٹر',
    hi: 'अलमराई फुल फैट मिल्क 1 लीटर',
    bn: 'আলমারাই ফুল ফ্যাট দুধ ১ লিটার',
    tl: 'Almarai Full Fat Milk 1 Liter'
  },
  'خبز صامولي هرفي 6 حبات': {
    ar: 'خبز صامولي هرفي 6 حبات',
    en: 'Herfy Samoli Bread 6pcs',
    ur: 'ہرفی صامولی روٹی 6 ٹکڑے',
    hi: 'हर्फी समोली ब्रेड 6 पीस',
    bn: 'হারফি সামোলি রুটি ৬ পিস',
    tl: 'Herfy Samoli Bread 6 Pieces'
  },
  'مياه نوفا صحية 330 مل': {
    ar: 'مياه نوفا صحية 330 مل',
    en: 'Nova Mineral Water 330ml',
    ur: 'نووا منرل واٹر 330 ملی لیٹر',
    hi: 'नोवा मिनरल वाटर 330 मिली',
    bn: 'নোভা মিনারেল ওয়াটার ৩৩০ মিলি',
    tl: 'Nova Mineral Water 330 ml'
  },
  'جبنة كرافت شيدر علبة 100غ': {
    ar: 'جبنة كرافت شيدر علبة 100غ',
    en: 'Kraft Cheddar Cheese 100g',
    ur: 'کرافٹ چیڈر پنیر 100 گرام',
    hi: 'क्राफ्ट चेडर चीज़ 100 ग्राम',
    bn: 'ক্রাফট চেডার পনির ১০০ গ্রাম',
    tl: 'Kraft Cheddar Cheese 100g'
  },
  'زبادي المراعي طازج 170غ': {
    ar: 'زبادي المراعي طازج 170غ',
    en: 'Almarai Fresh Yogurt 170g',
    ur: 'المراعي تازہ دہی 170 گرام',
    hi: 'अलमराई ताजा दही 170 ग्राम',
    bn: 'আলমারাই ফ্রেশ দই ১৭০ গ্রাম',
    tl: 'Almarai Fresh Yogurt 170g'
  },
  'عصير ربيع برتقال 250 مل': {
    ar: 'عصير ربيع برتقال 250 مل',
    en: 'Rabea Orange Juice 250ml',
    ur: 'ربيع مالٹا جوس 250 ملی لیٹر',
    hi: 'रबीज संतरे का जूस 250 मिली',
    bn: 'রাবিস কমলার জুস ২৫০ মিলি',
    tl: 'Rabea Orange Juice 250 ml'
  },
  'أرز الشعلان سيلا بسمتي 5 كجم': {
    ar: 'أرز الشعلان سيلا بسمتي 5 كجم',
    en: 'Al Shalan Sella Basmati Rice 5kg',
    ur: 'الشعلان سیلا باسپتی چاول 5 کلو',
    hi: 'अल शालन सेल्ला बासमती चावल 5 किलो',
    bn: 'আল শালান সেল্লা বাসমতি চাল ৫ কেজি',
    tl: 'Al Shalan Sella Basmati Rice 5 kg'
  },
  'شيبس ليز بالملح 160غ': {
    ar: 'شيبس ليز بالملح 160غ',
    en: 'Lays Salted Potato Chips 160g',
    ur: 'لیز سالٹڈ چپس 160 گرام',
    hi: 'लेज़ नमकीन आलू चिप्स 160 ग्राम',
    bn: 'লেজ নোনতা চিপস ১৬০ গ্রাম',
    tl: 'Lays Salted Chips 160g'
  },
  'طبق بيض طازج 30 حبة': {
    ar: 'طبق بيض طازج 30 حبة',
    en: 'Fresh Farm Eggs Tray 30pcs',
    ur: 'تازہ انڈوں کا ٹرے 30 دانے',
    hi: 'ताजा अंडों की ट्रे 30 पीस',
    bn: 'তাজা ডিমের ট্রে ৩০ পিস',
    tl: 'Fresh Eggs Tray 30 Pieces'
  },
  'مسحوق غسيل تايد 1.5 كجم': {
    ar: 'مسحوق غسيل تايد 1.5 كجم',
    en: 'Tide Laundry Detergent 1.5kg',
    ur: 'ٹائڈ واشنگ پاؤڈر 1.5 کلو',
    hi: 'टाइड डिटर्जेंट पाउडर 1.5 किलो',
    bn: 'টাইড ডিটারজেন্ট পাউডার ১.৫ কেজি',
    tl: 'Tide Washing Powder 1.5 kg'
  },
  'زيت عافية ذرة طهي 1.5 لتر': {
    ar: 'زيت عافية ذرة طهي 1.5 لتر',
    en: 'Afia Pure Corn Oil 1.5L',
    ur: 'عافیہ مکئی کا تیل 1.5 لیٹر',
    hi: 'आफिया कॉर्न कुकिंग ऑयल 1.5 लीटर',
    bn: 'আফিয়া কর্ন কুকিং অয়েল ১.৫ লিটার',
    tl: 'Afia Corn Cooking Oil 1.5 Liter'
  },
  'تفاح أحمر سكري 1 كجم': {
    ar: 'تفاح أحمر سكري 1 كجم',
    en: 'Sweet Red Apples 1kg',
    ur: 'سرخ میٹھے سیب 1 کلو',
    hi: 'लाल सेब 1 किलो',
    bn: 'লাল আপেল ১ কেজি',
    tl: 'Red Apple 1 kg'
  },
  'طماطم بلدي طازج 1 كجم': {
    ar: 'طماطم بلدي طازج 1 كجم',
    en: 'Fresh Local Tomatoes 1kg',
    ur: 'تازہ ٹماٹر 1 کلو',
    hi: 'ताजा टमाटर 1 किलो',
    bn: 'তাজা টমেটো ১ কেজি',
    tl: 'Fresh Tomato 1 kg'
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
  // Fallback to English translation if current language is missing, otherwise fallback string or Arabic
  if (translations && translations['en'] && lang !== 'ar') {
    return translations['en'];
  }
  if (translations && translations['ar']) {
    return translations['ar'];
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
  if (item && item['en']) {
    return item['en'];
  }
  return name;
}

/**
 * Translates category name if matches predefined dictionary.
 */
export function translateCategory(category: string, lang: LanguageCode): string {
  if (lang === 'ar') return category;
  const item = CATEGORY_TRANSLATIONS[category];
  if (item && item[lang]) {
    return item[lang];
  }
  if (item && item['en']) {
    return item['en'];
  }
  return category;
}

/**
 * Returns a bilingual string for printing / displaying.
 * If lang is 'ar', returns standard Arabic.
 * Otherwise returns "Arabic / Translated" with Arabic strictly primary.
 */
export function getBilingualText(arabicText: string, translatedText: string, lang: LanguageCode): string {
  if (lang === 'ar' || !translatedText || translatedText.trim() === arabicText.trim()) {
    return arabicText;
  }
  return `${arabicText} / ${translatedText}`;
}

/**
 * Returns a bilingual string for a dictionary key.
 * Always places the Arabic text first and foremost.
 */
export function getBilingualByKey(key: string, lang: LanguageCode, arabicFallback: string, translatedFallback?: string): string {
  if (lang === 'ar') return arabicFallback;
  const translated = t(key, lang, translatedFallback || arabicFallback);
  if (translated.trim() === arabicFallback.trim()) {
    return arabicFallback;
  }
  return `${arabicFallback} / ${translated}`;
}
