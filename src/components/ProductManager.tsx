import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, X, Check, Barcode, HelpCircle, PackageOpen, Sparkles, Download, Loader2, RefreshCw, AlertCircle, Upload, Image, FolderTree } from 'lucide-react';
import { Product } from '../types';

// Global keyword matching to fetch beautiful high-quality Unsplash product images
export const getProductImageByKeyword = (productName: string, productCategory: string = ''): string => {
  const nameLower = productName.toLowerCase();
  
  if (nameLower.includes('حليب') || nameLower.includes('لبن')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('خبز') || nameLower.includes('صامولي') || nameLower.includes('توست') || nameLower.includes('فطيرة') || nameLower.includes('مخبز')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('ماء') || nameLower.includes('مياه') || nameLower.includes('نوفا') || nameLower.includes('صحة')) {
    return 'https://images.unsplash.com/photo-1608885898957-a599fb1b467a?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('جبن') || nameLower.includes('كرافت') || nameLower.includes('شيدر') || nameLower.includes('موزاريلا') || nameLower.includes('أجبان') || nameLower.includes('قشطة')) {
    return 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('زبادي') || nameLower.includes('روب') || nameLower.includes('المراعي') || nameLower.includes('نادك')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('عصير') || nameLower.includes('ربيع') || nameLower.includes('برتقال')) {
    if (nameLower.includes('برتقال')) {
      return 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=80';
    }
  } else if (nameLower.includes('أرز') || nameLower.includes('شعلان') || nameLower.includes('كبسة')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('تفاح')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('برتقال') && productCategory === 'الخضار والفواكه') {
    return 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('موز')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('شيبس') || nameLower.includes('ليز') || nameLower.includes('بطاطس') || nameLower.includes('سناكس')) {
    return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('بيض') || nameLower.includes('طبق')) {
    return 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('غسيل') || nameLower.includes('تايد') || nameLower.includes('أوميل') || nameLower.includes('صابون') || nameLower.includes('تنظيف') || nameLower.includes('مطهر')) {
    return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('شوكولاتة') || nameLower.includes('نوتيلا') || nameLower.includes('جالكسي') || nameLower.includes('كندر') || nameLower.includes('حلويات') || nameLower.includes('سكاكر')) {
    return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('بسكويت') || nameLower.includes('أوريو') || nameLower.includes('كوكيز') || nameLower.includes('شاي')) {
    return 'https://images.unsplash.com/photo-1558961309-dbdf44783308?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('طماطم')) {
    return 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('خيار')) {
    return 'https://images.unsplash.com/photo-1604974449218-9ae6dd57b053?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('تمر') || nameLower.includes('تمور')) {
    return 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=500&auto=format&fit=crop&q=80';
  } else if (nameLower.includes('تونة') || nameLower.includes('معلبات') || nameLower.includes('فول')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
  } else {
    // Category specific fallback
    if (productCategory === 'الألبان والأجبان') {
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80';
    } else if (productCategory === 'المشروبات') {
      return 'https://images.unsplash.com/photo-1608885898957-a599fb1b467a?w=500&auto=format&fit=crop&q=80';
    } else if (productCategory === 'المخبوزات') {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80';
    } else if (productCategory === 'الخضار والفواكه') {
      return 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80';
    } else if (productCategory === 'مواد التنظيف') {
      return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80';
    } else if (productCategory === 'السكاكر والحلويات') {
      return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
    }
  }
};

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onClose: () => void;
  addToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onBulkImport?: (itemsToAdd: Omit<Product, 'id'>[], itemsToEdit: Product[]) => void;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ProductManager({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onClose,
  addToast,
  onBulkImport,
  categories,
  setCategories
}: ProductManagerProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  // Category management inner states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState(''); // Initialized dynamically in useEffect below
  const [stock, setStock] = useState<number | ''>('');
  const [image, setImage] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Synchronize first default category
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  // AI Products Generator State
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAIProducts, setIsGeneratingAIProducts] = useState(false);
  const [generatedAIProducts, setGeneratedAIProducts] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [aiError, setAiError] = useState('');

  // CSV Import State
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [csvFileDragging, setCsvFileDragging] = useState(false);
  const [csvParsedItems, setCsvParsedItems] = useState<any[]>([]);
  const [csvMappedHeaders, setCsvMappedHeaders] = useState<any>({});
  const [csvImportLog, setCsvImportLog] = useState<{ success: number; updated: number; error: string[] } | null>(null);
  const [csvDuplicateAction, setCsvDuplicateAction] = useState<'update' | 'skip'>('update');

  // AI Image generator simulation that acts exactly like deep AI generation using structured parameters
  const handleGenerateAIImage = (productName: string, productCategory: string) => {
    if (!productName.trim()) {
      if (addToast) {
        addToast('يرجى كتابة اسم المنتج أولاً حتى يتمكن الذكاء الاصطناعي من فهم تفاصيله وتوليد صورة مطابقة له!', 'warning');
      } else {
        alert('يرجى كتابة اسم المنتج أولاً حتى يتمكن الذكاء الاصطناعي من فهم تفاصيله وتوليد صورة مطابقة له!');
      }
      return;
    }

    setIsGeneratingImage(true);

    // Audio sound for processing
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    setTimeout(() => {
      setIsGeneratingImage(false);

      // Map to high-quality images based on search queries
      let selectedUrl = '';
      const nameLower = productName.toLowerCase();

      // Curated map of common grocery keywords to stunning, highly-detailed product photos
      if (nameLower.includes('حليب') || nameLower.includes('لبن')) {
        selectedUrl = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('خبز') || nameLower.includes('صامولي') || nameLower.includes('توست')) {
        selectedUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('ماء') || nameLower.includes('مياه') || nameLower.includes('نوفا') || nameLower.includes('صحة')) {
        selectedUrl = 'https://images.unsplash.com/photo-1608885898957-a599fb1b467a?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('جبن') || nameLower.includes('كرافت') || nameLower.includes('شيدر') || nameLower.includes('موزاريلا') || nameLower.includes('أجبان')) {
        selectedUrl = 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('زبادي') || nameLower.includes('روب') || nameLower.includes('المراعي')) {
        selectedUrl = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('عصير') || nameLower.includes('ربيع') || nameLower.includes('برتقال')) {
        if (nameLower.includes('برتقال')) {
          selectedUrl = 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=80';
        } else {
          selectedUrl = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=80';
        }
      } else if (nameLower.includes('أرز') || nameLower.includes('شعلان') || nameLower.includes('كبسة')) {
        selectedUrl = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('تفاح')) {
        selectedUrl = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('برتقال') && productCategory === 'الخضار والفواكه') {
        selectedUrl = 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('موز')) {
        selectedUrl = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('شيبس') || nameLower.includes('ليز') || nameLower.includes('بطاطس')) {
        selectedUrl = 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('بيض') || nameLower.includes('طبق')) {
        selectedUrl = 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('غسيل') || nameLower.includes('تايد') || nameLower.includes('أوميل') || nameLower.includes('صابون') || nameLower.includes('تنظيف')) {
        selectedUrl = 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('شوكولاتة') || nameLower.includes('نوتيلا') || nameLower.includes('جالكسي') || nameLower.includes('كندر') || nameLower.includes('حلويات')) {
        selectedUrl = 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('بسكويت') || nameLower.includes('أوريو') || nameLower.includes('كوكيز') || nameLower.includes('شاي')) {
        selectedUrl = 'https://images.unsplash.com/photo-1558961309-dbdf44783308?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('طماطم')) {
        selectedUrl = 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('خيار')) {
        selectedUrl = 'https://images.unsplash.com/photo-1604974449218-9ae6dd57b053?w=500&auto=format&fit=crop&q=80';
      } else if (nameLower.includes('تمر') || nameLower.includes('تمور')) {
        selectedUrl = 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=500&auto=format&fit=crop&q=80';
      } else {
        // Fallback to high-quality grocery image
        selectedUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
      }

      setImage(selectedUrl);
      
      // Success sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch (e) {}

    }, 1800);
  };

  // Handle auto-generating standard 13-digit barcode starting with 628 (Saudi country code)
  const handleGenerateBarcode = () => {
    let randCode = '628';
    for (let i = 0; i < 10; i++) {
      randCode += Math.floor(Math.random() * 10).toString();
    }
    setBarcode(randCode);
  };

  const handleImageFileChange = (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, SVG, WebP)', 'error');
      return;
    }
    
    // Check size limit to avoid overflowing localStorage space
    if (file.size > 2 * 1024 * 1024) {
      addToast('حجم الصورة كبير جداً! يرجى اختيار صورة أصغر من 2 ميجابايت لتخزينها محلياً.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        addToast('تم تحميل ومعالجة صورة السلعة بنجاح!', 'success');
      }
    };
    reader.onerror = () => {
      addToast('حدث خطأ أثناء قراءة ملف الصورة!', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleOpenAddForm = () => {
    setName('');
    setPrice('');
    setCostPrice('');
    setBarcode('');
    setCategory(categories[0] || 'أخرى');
    setStock('');
    setImage('');
    setImageMode('upload');
    setIsUnavailable(false);
    setEditingId(null);
    setIsEditing(false);
    setShowForm(true);
    setShowAIGenerator(false);
    setFormError('');
  };

  const handleOpenEditForm = (prod: Product) => {
    setName(prod.name);
    setPrice(prod.price);
    setCostPrice(prod.costPrice || '');
    setBarcode(prod.barcode);
    setCategory(prod.category);
    setStock(prod.stock);
    setImage(prod.image || '');
    if (prod.image && prod.image.startsWith('http')) {
      setImageMode('url');
    } else {
      setImageMode('upload');
    }
    setIsUnavailable(!!prod.isUnavailable);
    setEditingId(prod.id);
    setIsEditing(true);
    setShowForm(true);
    setShowAIGenerator(false);
    setFormError('');
  };

  const handleGenerateAIProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      setAiError('يرجى كتابة وصف أو اسم القسم المراد توليده');
      return;
    }

    setIsGeneratingAIProducts(true);
    setAiError('');
    setGeneratedAIProducts([]);

    try {
      const response = await fetch('/api/gemini/generate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('فشل في الاتصال بخادم الذكاء الاصطناعي');
      }

      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        const mapped = data.products.map((p: any, idx: number) => {
          const imgUrl = getProductImageByKeyword(p.name, p.category);
          return {
            tempId: `temp-${Date.now()}-${idx}`,
            name: p.name,
            price: Number(p.price) || 0,
            costPrice: Number(p.costPrice) || 0,
            barcode: p.barcode || `628${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            category: p.category || (categories[0] || 'أخرى'),
            stock: Number(p.stock) || 10,
            image: imgUrl,
            isSelected: true
          };
        });
        setGeneratedAIProducts(mapped);
        setIsDemoMode(!!data.isDemo);
        if (data.warning) {
          setAiError(data.warning);
        }
      } else {
        throw new Error('تنسيق البيانات المستلمة غير صالح');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('حدث خطأ أثناء الاتصال بالخادم، تم استخدام وضع المحاكاة الذكي لتوليد منتجات مقترحة.');
      
      // Local fallback generation
      const mockGenerator = (promptText: string): any[] => {
        const promptLower = promptText.toLowerCase();
        let matched = [
          { name: `تونة قودي خفيف بالزيت 185غ`, price: 8.50, costPrice: 6.00, category: "المعلبات", stock: 24 },
          { name: `معكرونة قودي سباغيتي 500غ`, price: 5.75, costPrice: 4.10, category: "المعلبات", stock: 30 },
          { name: `بسكويت أولكر بالتمر عبوة عائلية`, price: 12.50, costPrice: 9.00, category: "السكاكر والحلويات", stock: 15 }
        ];
        if (promptLower.includes('حليب') || promptLower.includes('ألبان') || promptLower.includes('جبن')) {
          matched = [
            { name: "حليب نادك كامل الدسم 2 لتر", price: 11.00, costPrice: 8.50, category: "الألبان والأجبان", stock: 30 },
            { name: "جبنة بوك كاسات بيضاء 500غ", price: 17.50, costPrice: 13.00, category: "الألبان والأجبان", stock: 24 },
            { name: "لبنة بينار تركي طازجة 400غ", price: 14.25, costPrice: 11.00, category: "الألبان والأجبان", stock: 15 }
          ];
        } else if (promptLower.includes('عصير') || promptLower.includes('بارد') || promptLower.includes('ماء') || promptLower.includes('مشروب')) {
          matched = [
            { name: "عصير المراعي برتقال طازج 1.5 لتر", price: 12.00, costPrice: 9.00, category: "المشروبات", stock: 25 },
            { name: "مشروب غازي بيبسي عائلي 2.25 لتر", price: 9.50, costPrice: 7.20, category: "المشروبات", stock: 35 },
            { name: "مياه أكوافينا كرتون 30 حبة", price: 15.00, costPrice: 11.50, category: "المشروبات", stock: 50 }
          ];
        }
        return matched.map((p, idx) => {
          const barcodeSuffix = Math.floor(1000000000 + Math.random() * 9000000000).toString();
          return {
            tempId: `temp-fallback-${Date.now()}-${idx}`,
            name: `${p.name} (${promptText})`,
            price: p.price,
            costPrice: p.costPrice,
            barcode: "628" + barcodeSuffix.slice(0, 10),
            category: p.category,
            stock: p.stock,
            image: getProductImageByKeyword(p.name, p.category),
            isSelected: true
          };
        });
      };
      setGeneratedAIProducts(mockGenerator(aiPrompt));
      setIsDemoMode(true);
    } finally {
      setIsGeneratingAIProducts(false);
    }
  };

  const handleUpdateGeneratedProductField = (tempId: string, field: string, value: any) => {
    setGeneratedAIProducts(prev => prev.map(p => {
      if (p.tempId === tempId) {
        const updated = { ...p, [field]: value };
        if (field === 'name') {
          updated.image = getProductImageByKeyword(value, p.category);
        }
        return updated;
      }
      return p;
    }));
  };

  const handleToggleGeneratedSelection = (tempId: string) => {
    setGeneratedAIProducts(prev => prev.map(p => 
      p.tempId === tempId ? { ...p, isSelected: !p.isSelected } : p
    ));
  };

  const handleChangeGeneratedProductImage = (tempId: string) => {
    const randomGroceries = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543083505-590d3473bf3e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?w=500&auto=format&fit=crop&q=80'
    ];
    const randomImg = randomGroceries[Math.floor(Math.random() * randomGroceries.length)];
    setGeneratedAIProducts(prev => prev.map(p => 
      p.tempId === tempId ? { ...p, image: randomImg } : p
    ));
  };

  const handleImportSelectedProducts = () => {
    const toAdd = generatedAIProducts.filter(p => p.isSelected);
    if (toAdd.length === 0) {
      if (addToast) {
        addToast('يرجى تحديد منتج واحد على الأقل لإضافته للمخزن', 'warning');
      } else {
        alert('يرجى تحديد منتج واحد على الأقل لإضافته للمخزن');
      }
      return;
    }

    let duplicatesCount = 0;
    toAdd.forEach(item => {
      let finalBarcode = item.barcode;
      const isDuplicate = products.some(p => p.barcode === finalBarcode);
      if (isDuplicate) {
        finalBarcode = `628${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        duplicatesCount++;
      }
      onAddProduct({
        name: item.name.trim(),
        price: Number(item.price),
        costPrice: item.costPrice ? Number(item.costPrice) : undefined,
        barcode: finalBarcode,
        category: item.category,
        stock: Number(item.stock),
        image: item.image,
      });
    });

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}

    if (addToast) {
      addToast(`تم بنجاح استيراد ${toAdd.length} منتجات جديدة لرفوف المخزن!${duplicatesCount > 0 ? ' (تم تجديد الباركود لبعض المنتجات تجنباً للتكرار)' : ''}`, 'success');
    } else {
      alert(`تم بنجاح استيراد ${toAdd.length} منتجات جديدة لرفوف المخزن!${duplicatesCount > 0 ? '\n(تم تجديد الباركود لبعض المنتجات تجنباً للتكرار)' : ''}`);
    }
    setGeneratedAIProducts([]);
    setShowAIGenerator(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) return setFormError('يرجى إدخال اسم المنتج');
    if (price === '' || price <= 0) return setFormError('يرجى إدخال سعر بيع صحيح أكبر من 0');
    if (!barcode.trim()) return setFormError('يرجى إدخال باركود أو توليد باركود عشوائي');
    if (stock === '' || stock < 0) return setFormError('يرجى إدخال كمية المخزون بشكل صحيح');

    // Check if barcode is already used by another product (skip check when editing same product)
    const barcodeDuplicate = products.find(p => p.barcode === barcode && p.id !== editingId);
    if (barcodeDuplicate) {
      return setFormError(`الباركود مستخدم بالفعل لمنتج آخر: "${barcodeDuplicate.name}"`);
    }

    const itemData = {
      name: name.trim(),
      price: Number(price),
      costPrice: costPrice !== '' ? Number(costPrice) : undefined,
      barcode: barcode.trim(),
      category,
      stock: Number(stock),
      image: image.trim() || undefined,
      isUnavailable: isUnavailable
    };

    if (isEditing && editingId) {
      onEditProduct({ id: editingId, ...itemData });
    } else {
      onAddProduct(itemData);
    }

    setShowForm(false);
  };

  // Filtered list of products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.barcode.includes(searchTerm) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Robust CSV parser supporting quotes, commas within quotes, and double-quoted values
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentField = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentField.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          result.push(row);
        }
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField !== '' || row.length > 0) {
      row.push(currentField.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        result.push(row);
      }
    }
    return result;
  };

  const downloadCSVTemplate = () => {
    let csvContent = "\uFEFF"; // Byte Order Mark for Excel to recognize UTF-8 instantly
    csvContent += "اسم السلعة,الباركود,القسم,سعر الشراء,سعر البيع,المخزون\n";
    csvContent += "حليب المراعي 1 لتر,6281001122334,الألبان والأجبان,5.50,7.00,45\n";
    csvContent += "خبز صامولي كيس,6281001122556,المخبوزات,1.00,1.50,20\n";
    csvContent += "ماء صفا 330 مل,6281001122778,المشروبات,0.50,1.00,150\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "نموذج_مخزون_البقالة.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (addToast) addToast('تم تحميل نموذج الاستيراد بنجاح! يمكنك فتحه وتعبئته باستخدام برنامج Excel.', 'success');
  };

  const handleCSVFileChange = (file: File) => {
    if (!file) return;
    
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      if (addToast) addToast('يرجى اختيار ملف بصيغة CSV فقط!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        if (addToast) addToast('الملف فارغ أو لم نتمكن من قراءته!', 'error');
        return;
      }

      const rows = parseCSV(text);
      if (rows.length < 2) {
        if (addToast) addToast('الملف لا يحتوي على صفوف بيانات كافية (يجب أن يحتوي على سطر العناوين وسطر بيانات واحد على الأقل)!', 'error');
        return;
      }

      const headers = rows[0];
      
      // Keywords mapping for smart autodetect
      const nameKeywords = ['اسم السلعة', 'اسم المنتج', 'الاسم', 'المنتج', 'name', 'product', 'item'];
      const barcodeKeywords = ['الباركود', 'باركود', 'رقم الباركود', 'barcode', 'code', 'bar'];
      const categoryKeywords = ['القسم', 'الفئة', 'التصنيف', 'category', 'group', 'dept', 'department'];
      const priceKeywords = ['سعر البيع', 'السعر', 'سعر', 'price', 'retail', 'sale'];
      const costPriceKeywords = ['سعر الشراء', 'التكلفة', 'سعر التكلفة', 'cost', 'purchase'];
      const stockKeywords = ['المخزون', 'الكمية', 'الكمية المتوفرة', 'stock', 'qty', 'quantity'];

      const findHeaderIndex = (keywords: string[]): number => {
        return headers.findIndex(h => {
          const cleanHeader = h.trim().toLowerCase();
          return keywords.some(keyword => cleanHeader.includes(keyword.toLowerCase()));
        });
      };

      const mapped = {
        name: findHeaderIndex(nameKeywords),
        barcode: findHeaderIndex(barcodeKeywords),
        category: findHeaderIndex(categoryKeywords),
        price: findHeaderIndex(priceKeywords),
        costPrice: findHeaderIndex(costPriceKeywords),
        stock: findHeaderIndex(stockKeywords)
      };

      setCsvMappedHeaders(mapped);

      // Verify that Name and Price are present
      if (mapped.name === -1 || mapped.price === -1) {
        if (addToast) addToast('لم نتمكن من العثور على أعمدة "اسم السلعة" و "سعر البيع" الضرورية تلقائياً! يرجى التأكد من عناوين الأعمدة.', 'error');
        return;
      }

      // Parse records
      const parsedItems: any[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || (row.length === 1 && row[0] === '')) continue; // skip empty lines

        const nameVal = row[mapped.name] || '';
        if (!nameVal) continue; // skip empty names

        const priceVal = parseFloat(row[mapped.price] || '0');
        const costPriceVal = mapped.costPrice !== -1 && row[mapped.costPrice] ? parseFloat(row[mapped.costPrice]) : (priceVal * 0.7);
        const stockVal = mapped.stock !== -1 && row[mapped.stock] ? parseInt(row[mapped.stock], 10) : 0;
        
        let barcodeVal = mapped.barcode !== -1 && row[mapped.barcode] ? row[mapped.barcode].replace(/["']/g, '').trim() : '';
        if (!barcodeVal) {
          // Auto generate if empty
          barcodeVal = '628' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
        }

        let categoryVal = mapped.category !== -1 && row[mapped.category] ? row[mapped.category].trim() : 'أخرى';
        // Fallback to valid categories if not matched
        const matchedCategory = categories.find(c => c.toLowerCase() === categoryVal.toLowerCase() || categoryVal.includes(c));
        categoryVal = matchedCategory || (categories[0] || 'أخرى'); // default to first real category

        parsedItems.push({
          name: nameVal,
          barcode: barcodeVal,
          category: categoryVal,
          price: isNaN(priceVal) ? 0 : priceVal,
          costPrice: isNaN(costPriceVal) ? (isNaN(priceVal) ? 0 : priceVal * 0.7) : costPriceVal,
          stock: isNaN(stockVal) ? 0 : stockVal,
          isUnavailable: stockVal <= 0
        });
      }

      if (parsedItems.length === 0) {
        if (addToast) addToast('لا توجد منتجات صالحة في ملف CSV المستورد!', 'warning');
        return;
      }

      setCsvParsedItems(parsedItems);
      setCsvImportLog(null);
      if (addToast) addToast(`تم قراءة ${parsedItems.length} سلعة من الملف بنجاح! يرجى مراجعة الجدول للتحقق قبل الحفظ.`, 'info');
    };

    reader.readAsText(file);
  };

  const executeCSVImport = () => {
    if (csvParsedItems.length === 0) return;

    const itemsToAdd: Omit<Product, 'id'>[] = [];
    const itemsToEdit: Product[] = [];
    let successCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    csvParsedItems.forEach((item) => {
      const existingProduct = products.find(p => p.barcode === item.barcode);

      if (existingProduct) {
        if (csvDuplicateAction === 'update') {
          itemsToEdit.push({
            ...existingProduct,
            name: item.name,
            category: item.category,
            price: item.price,
            costPrice: item.costPrice,
            stock: item.stock,
            isUnavailable: item.stock <= 0
          });
          updatedCount++;
        } else {
          // skip
        }
      } else {
        itemsToAdd.push({
          name: item.name,
          barcode: item.barcode,
          category: item.category,
          price: item.price,
          costPrice: item.costPrice,
          stock: item.stock,
          isUnavailable: item.stock <= 0
        });
        successCount++;
      }
    });

    if (onBulkImport) {
      onBulkImport(itemsToAdd, itemsToEdit);
    } else {
      itemsToAdd.forEach(item => onAddProduct(item));
      itemsToEdit.forEach(item => onEditProduct(item));
      if (addToast) {
        addToast(`نجحت العملية! تم استيراد ${itemsToAdd.length} منتج جديد وتحديث ${itemsToEdit.length} منتج سابق.`, 'success');
      }
    }

    setCsvImportLog({
      success: successCount,
      updated: updatedCount,
      error: errors
    });

    setTimeout(() => {
      setCsvParsedItems([]);
      setIsCsvImportOpen(false);
      setCsvImportLog(null);
    }, 2500);
  };

  const handleExportToCSV = () => {
    let csvContent = "\uFEFF";
    csvContent += "رقم السلعة,اسم السلعة,الباركود,القسم,سعر الشراء (ر.س),سعر البيع (ر.س),المخزون الحالي,الحالة\n";
    
    products.forEach((prod) => {
      const isUnavailableText = prod.isUnavailable ? "غير متوفر" : "متوفر";
      const row = [
        prod.id,
        `"${prod.name.replace(/"/g, '""')}"`,
        `"${prod.barcode}"`,
        `"${prod.category}"`,
        prod.costPrice ? prod.costPrice.toFixed(2) : (prod.price * 0.7).toFixed(2),
        prod.price.toFixed(2),
        prod.stock,
        `"${isUnavailableText}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `مخزون_البقالة_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col relative" id="product-manager-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-lg">إدارة وتعديل المنتجات</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              {products.length} منتج مسجل
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-150 px-5 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PackageOpen className="w-4 h-4" />
            <span>المنتجات والسلع</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>تصنيفات السلع (الأقسام)</span>
          </button>
        </div>

        {activeTab === 'products' ? (
          /* Content Body: Two columns layout when adding/editing, else table */
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Main List column */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج بالاسم، الباركود أو التصنيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-gray-100/70 hover:bg-gray-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-indigo-500/30 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 bg-gray-100/70 border border-transparent rounded-xl text-sm focus:outline-none focus:border-indigo-500/30 font-medium text-gray-700 cursor-pointer"
                >
                  {['الكل', ...categories].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={handleExportToCSV}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shrink-0 shadow-sm shadow-emerald-100 cursor-pointer"
                  title="تنزيل قائمة السلع كملف إكسيل CSV"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير المخزون (Excel)</span>
                </button>
                <button
                  onClick={() => {
                    setIsCsvImportOpen(true);
                    setCsvParsedItems([]);
                    setCsvImportLog(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-sm rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
                  title="استيراد وتحديث المنتجات من ملف إكسيل CSV"
                >
                  <Upload className="w-4 h-4" />
                  <span>استيراد مخزون (Excel)</span>
                </button>
                <button
                  onClick={() => {
                    setShowAIGenerator(!showAIGenerator);
                    setShowForm(false);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 ${showAIGenerator ? 'bg-indigo-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white font-medium text-sm rounded-xl transition-all shrink-0 shadow-sm shadow-indigo-100 cursor-pointer active:scale-95`}
                  title="توليد وتصنيف سلع جديدة بالذكاء الاصطناعي كلياً"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>توليد منتجات بالذكاء ⚡</span>
                </button>
                <button
                  onClick={handleOpenAddForm}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shrink-0 shadow-sm shadow-indigo-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>
            </div>

            {/* Products list table */}
            <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-white">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">لم نجد أي منتجات تطابق البحث</p>
                  <p className="text-gray-400 text-xs mt-1">تأكد من كتابة الاسم أو الباركود بشكل صحيح، أو أضف منتجاً جديداً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase border-b border-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3.5">المنتج والباركود</th>
                        <th className="px-4 py-3.5">التصنيف</th>
                        <th className="px-4 py-3.5 text-left">التكلفة</th>
                        <th className="px-4 py-3.5 text-left">سعر البيع</th>
                        <th className="px-4 py-3.5 text-center">المخزون</th>
                        <th className="px-4 py-3.5 text-center">الربح المتوقع</th>
                        <th className="px-4 py-3.5 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredProducts.map((prod) => {
                        const profit = prod.costPrice ? prod.price - prod.costPrice : null;
                        const isLowStock = prod.stock <= 5;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {prod.image ? (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    <img src={prod.image} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                                    <PackageOpen className="w-4 h-4 text-indigo-400" />
                                  </div>
                                )}
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`font-semibold ${prod.isUnavailable ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{prod.name}</span>
                                    {prod.isUnavailable && (
                                      <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200/60 px-1.5 py-0.5 rounded font-extrabold">غير متوفر ❌</span>
                                    )}
                                  </div>
                                  <span className="font-mono text-gray-400 text-[10px] flex items-center gap-1">
                                    <Barcode className="w-3.5 h-3.5 text-gray-300" />
                                    {prod.barcode}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                {prod.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-left font-mono font-medium">
                              {prod.costPrice ? `${prod.costPrice.toFixed(2)} ر.س` : '-'}
                            </td>
                            <td className="px-4 py-3 text-left font-mono font-bold text-indigo-700">
                              {prod.price.toFixed(2)} ر.س
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isLowStock 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse' 
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {prod.stock} حبة {isLowStock && '(منخفض)'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {profit !== null ? (
                                <span className="text-emerald-600 font-semibold font-mono">
                                  +{profit.toFixed(2)} ر.س ({Math.round((profit / prod.price) * 100)}%)
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">غير محدد</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-left">
                              {false ? (
                                <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-fade-in justify-end">
                                  <span className="text-[9px] font-bold text-rose-700 px-1">متأكد؟</span>
                                  <button
                                    onClick={() => {
                                      onDeleteProduct(prod.id);
                                      setProductToDelete(null);
                                    }}
                                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    حذف
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(null)}
                                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    تراجع
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditForm(prod)}
                                    className="p-1.5 hover:bg-slate-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                                    title="تعديل المنتج"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(prod)}
                                    className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                    title="حذف المنتج"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Form Side Drawer */}
          {showForm && (
            <div className="w-full md:w-[360px] border-r md:border-r-0 md:border-l border-gray-100 bg-gray-50/50 p-5 overflow-y-auto flex flex-col justify-between shrink-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    {isEditing ? 'تعديل تفاصيل السلعة' : 'إضافة سلعة جديدة للمخزن'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] rounded-lg flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-gray-600 font-medium text-[11px]">اسم المنتج بالكامل *</label>
                    <input
                      type="text"
                      placeholder="مثال: علبة حليب نادك قليل الدسم"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 font-medium"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-gray-600 font-medium text-[11px]">التصنيف الرئيسي *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-700 font-medium cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Barcode input & generate */}
                  <div className="space-y-1">
                    <label className="text-gray-600 font-medium text-[11px] flex justify-between items-center">
                      <span>الرمز الشريطي (الباركود) *</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="امسح بالجهاز أو اكتبه"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateBarcode}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                        title="توليد باركود تلقائي"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                        <span>توليد باركود</span>
                      </button>
                    </div>
                  </div>

                  {/* Prices & Profit */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-gray-600 font-medium text-[11px]">تكلفة الشراء (اختياري)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full pl-7 pr-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 font-mono font-bold"
                        />
                        <span className="absolute left-2.5 top-2.5 text-[9px] text-gray-400 font-sans">ر.س</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-600 font-medium text-[11px]">سعر البيع المعتمد *</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                          className="w-full pl-7 pr-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 font-mono font-bold"
                        />
                        <span className="absolute left-2.5 top-2.5 text-[9px] text-gray-400 font-sans">ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1">
                    <label className="text-gray-600 font-medium text-[11px]">الكمية المتوفرة في الرفوف (المخزن) *</label>
                    <input
                      type="number"
                      placeholder="عدد العلب أو الحبات"
                      value={stock}
                      onChange={(e) => setStock(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 font-mono font-bold"
                    />
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">تعليم السلعة كـ "غير متوفرة"</span>
                      <span className="text-[10px] text-slate-400 block">إيقاف البيع والمسح مؤقتاً في الكاشير</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isUnavailable}
                        onChange={(e) => setIsUnavailable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>

                  {/* Image Field, Upload and AI Generator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-gray-700 font-bold text-[11px] flex items-center gap-1">
                        <Image className="w-3.5 h-3.5 text-indigo-500" />
                        <span>صورة السلعة</span>
                      </label>
                      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setImageMode('upload')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${imageMode === 'upload' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          رفع ملف صورة
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode('url')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${imageMode === 'url' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          رابط ويب / ذكاء
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {imageMode === 'upload' ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('product-image-file-input')?.click()}
                          className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden min-h-[110px] ${
                            isDragging 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="file"
                            id="product-image-file-input"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageFileChange(e.target.files[0]);
                              }
                            }}
                          />
                          {image ? (
                            <div className="relative w-full flex flex-col items-center justify-center gap-2">
                              <div className="relative h-20 w-32 border border-slate-100 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                                <img
                                  src={image}
                                  alt="معاينة"
                                  className="max-h-full max-w-full object-contain rounded"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImage('');
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer shadow"
                                  title="حذف الصورة"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[10px] text-indigo-600 font-semibold underline">
                                انقر أو اسحب لتغيير صورة السلعة
                              </span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-7 h-7 text-indigo-500 animate-pulse" />
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-slate-700 block">اسحب وأسقط صورة السلعة هنا</span>
                                <span className="text-[9px] text-slate-400 block">أو انقر لاختيار ملف من جهازك (PNG, JPG, SVG, WebP)</span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="أدخل رابط صورة مباشر من الإنترنت (أو اضغط توليد بالذكاء)"
                              value={image}
                              onChange={(e) => setImage(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white text-xs border border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 text-left"
                            />
                            <button
                              type="button"
                              onClick={() => handleGenerateAIImage(name, category)}
                              className="px-2.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm shadow-indigo-100"
                              title="توليد صورة بالذكاء الاصطناعي"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                              <span>توليد بالذكاء</span>
                            </button>
                          </div>

                          {/* Image Preview / Generating State */}
                          {isGeneratingImage ? (
                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center animate-pulse">
                              <div className="relative flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-indigo-500 animate-spin" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-indigo-900 block">جاري الاتصال بـ Gemini AI...</span>
                                <span className="text-[9px] text-indigo-600/80 block">توليد ورسم صورة عالية الدقة لـ "{name || 'السلعة'}"</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-1 rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '70%' }}></div>
                              </div>
                            </div>
                          ) : image ? (
                            <div className="relative p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden group flex items-center justify-center h-24">
                              <img
                                src={image}
                                alt="معاينة السلعة"
                                className="h-full object-contain rounded-lg"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // If image fails, fallback to a nice placeholder
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setImage('')}
                                className="absolute top-1.5 left-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                                title="حذف الصورة"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'حفظ التعديلات' : 'إضافة للرفوف'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI Products Generator Side Drawer */}
          {showAIGenerator && (
            <div className="w-full md:w-[420px] border-r md:border-r-0 md:border-l border-gray-100 bg-indigo-50/20 p-5 overflow-y-auto flex flex-col justify-between shrink-0">
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                  <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>توليد المنتجات بالذكاء الاصطناعي</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAIGenerator(false)}
                    className="p-1 hover:bg-indigo-100/60 rounded text-indigo-500 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-indigo-900/70 leading-relaxed text-right">
                  اكتب اسماً لفرع مبيعات، أو سلعاً ترغب في إضافتها، وسيقوم الذكاء الاصطناعي باقتراح باقة متكاملة من السلع بالأسعار والباركودات المناسبة!
                </p>

                {/* Suggestion Chips */}
                <div className="space-y-1.5 text-right">
                  <span className="text-[10px] text-indigo-800/60 font-bold block">أفكار مقترحة للبحث:</span>
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {[
                      'مشروبات باردة وعصائر الصيف',
                      'منتجات فطور وألبان المراعي',
                      'حلويات وسكاكر تسالي للأطفال',
                      'مخبوزات كرواسون وتوست طازج',
                      'صابون ومنظفات للمطبخ والمنزل'
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setAiPrompt(chip)}
                        className="px-2.5 py-1 text-[10px] bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input */}
                <form onSubmit={handleGenerateAIProducts} className="space-y-2 pt-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="مثال: أجبان وقشطة المراعي، سكاكر العيد..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      disabled={isGeneratingAIProducts}
                      className="flex-1 px-3 py-2 bg-white text-xs border border-indigo-200 focus:border-indigo-500 rounded-lg focus:outline-none transition-all text-gray-800 font-medium text-right"
                    />
                    <button
                      type="submit"
                      disabled={isGeneratingAIProducts}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-indigo-100"
                    >
                      {isGeneratingAIProducts ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>توليد</span>
                    </button>
                  </div>
                  {aiError && (
                    <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1 justify-end">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{aiError}</span>
                    </p>
                  )}
                </form>

                {/* Loading State */}
                {isGeneratingAIProducts && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <Sparkles className="w-5 h-5 text-indigo-600 absolute top-2.5 left-2.5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-950 block">جاري التواصل مع Gemini...</span>
                      <span className="text-[10px] text-indigo-600 animate-pulse block">نقوم بابتكار وتصميم السلع بالباركودات والأسعار ومطابقة الصور...</span>
                    </div>
                  </div>
                )}

                {/* Generated List */}
                {!isGeneratingAIProducts && generatedAIProducts.length > 0 && (
                  <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-900/60 uppercase">السلع المقترحة ({generatedAIProducts.length})</span>
                      {isDemoMode && (
                        <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                          وضع المحاكاة الذكي
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[48vh]">
                      {generatedAIProducts.map((p) => (
                        <div 
                          key={p.tempId} 
                          className={`p-3 rounded-xl border transition-all ${p.isSelected ? 'bg-white border-indigo-200 shadow-sm' : 'bg-gray-100/50 border-gray-200 opacity-60'}`}
                        >
                          <div className="flex gap-2.5 items-start">
                            {/* Select Checkbox */}
                            <div className="flex items-center pt-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleGeneratedSelection(p.tempId)}
                                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={p.isSelected} 
                                  onChange={() => {}} 
                                  className="w-3.5 h-3.5 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                              </button>
                            </div>

                            {/* Image with change capability */}
                            <div className="relative w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 group">
                              <img 
                                src={p.image} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleChangeGeneratedProductImage(p.tempId)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-bold cursor-pointer"
                                title="تغيير الصورة عشوائياً"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin-slow" />
                              </button>
                            </div>

                            {/* Fields editing */}
                            <div className="flex-1 space-y-1.5 min-w-0 text-right">
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => handleUpdateGeneratedProductField(p.tempId, 'name', e.target.value)}
                                className="w-full font-bold text-xs text-gray-800 bg-transparent hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 border-none focus:outline-none truncate text-right"
                                title="انقر لتعديل الاسم"
                              />
                              
                              <div className="grid grid-cols-2 gap-1.5">
                                {/* Price */}
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[10px] text-gray-400">البيع:</span>
                                  <input
                                    type="number"
                                    value={p.price}
                                    onChange={(e) => handleUpdateGeneratedProductField(p.tempId, 'price', Number(e.target.value))}
                                    className="w-14 font-semibold text-[11px] text-emerald-600 bg-transparent hover:bg-gray-50 focus:bg-white rounded px-0.5 py-0.5 border-none focus:outline-none text-right"
                                    step="0.01"
                                  />
                                </div>
                                
                                {/* Cost */}
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[10px] text-gray-400">الشراء:</span>
                                  <input
                                    type="number"
                                    value={p.costPrice}
                                    onChange={(e) => handleUpdateGeneratedProductField(p.tempId, 'costPrice', Number(e.target.value))}
                                    className="w-14 font-semibold text-[11px] text-slate-600 bg-transparent hover:bg-gray-50 focus:bg-white rounded px-0.5 py-0.5 border-none focus:outline-none text-right"
                                    step="0.01"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                {/* Category */}
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[10px] text-gray-400">القسم:</span>
                                  <select
                                    value={p.category}
                                    onChange={(e) => handleUpdateGeneratedProductField(p.tempId, 'category', e.target.value)}
                                    className="text-[10px] text-indigo-700 bg-transparent hover:bg-gray-50 focus:bg-white rounded px-0.5 py-0.5 border-none focus:outline-none cursor-pointer text-right"
                                  >
                                    {categories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Stock */}
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[10px] text-gray-400">الكمية:</span>
                                  <input
                                    type="number"
                                    value={p.stock}
                                    onChange={(e) => handleUpdateGeneratedProductField(p.tempId, 'stock', Number(e.target.value))}
                                    className="w-10 font-medium text-[11px] text-slate-800 bg-transparent hover:bg-gray-50 focus:bg-white rounded px-0.5 py-0.5 border-none focus:outline-none text-right"
                                  />
                                </div>
                              </div>

                              {/* Barcode */}
                              <div className="text-[9px] text-gray-400 font-mono font-semibold flex items-center gap-1 truncate select-all justify-end" title="باركود السلعة">
                                <Barcode className="w-3 h-3 shrink-0 text-gray-400" />
                                <span>{p.barcode}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Import Buttons */}
              {generatedAIProducts.length > 0 && (
                <div className="pt-3 border-t border-indigo-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedAIProducts([])}
                    className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    مسح السلة
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSelectedProducts}
                    className="flex-2 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>إضافة للمخزن ({generatedAIProducts.filter(p => p.isSelected).length})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        ) : (
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 bg-slate-50/30 text-right" style={{ direction: 'rtl' }}>
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                <FolderTree className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-indigo-950 block text-right">تنظيم وتعديل تصنيفات السلع</span>
                <p className="text-[11px] text-slate-600 leading-relaxed text-right">
                  يمكنك إضافة تصنيفات جديدة لتنظيم السلع والمنتجات داخل الكاشير بشكل مريح، أو تعديل وتغيير مسميات الأقسام الحالية، أو حذفها.
                </p>
              </div>
            </div>

            {/* Add category form */}
            <div className="bg-white p-4 border border-gray-150 rounded-xl space-y-3">
              <h4 className="font-bold text-gray-800 text-xs text-right">إضافة قسم/تصنيف جديد</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: مستلزمات الرحلات، حلويات العيد..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-gray-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg focus:outline-none transition-all text-gray-800 font-semibold text-right"
                />
                <button
                  onClick={() => {
                    const trimmed = newCategoryName.trim();
                    if (!trimmed) return;
                    if (categories.includes(trimmed)) {
                      addToast?.('هذا التصنيف موجود بالفعل!', 'warning');
                      return;
                    }
                    setCategories(prev => [...prev, trimmed]);
                    setNewCategoryName('');
                    addToast?.(`تمت إضافة التصنيف الجديد "${trimmed}" بنجاح!`, 'success');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة تصنيف</span>
                </button>
              </div>
            </div>

            {/* Categories list table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right">اسم التصنيف</th>
                    <th className="px-4 py-3 text-center">عدد السلع المدرجة</th>
                    <th className="px-4 py-3 text-left">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {categories.map((cat, idx) => {
                    const count = products.filter(p => p.category === cat).length;
                    const isEditingThis = editingCategoryIndex === idx;

                    return (
                      <tr key={cat} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-right">
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="px-2 py-1 border border-indigo-500 focus:outline-none rounded text-xs font-semibold w-full max-w-xs text-right"
                              autoFocus
                            />
                          ) : (
                            <span className="font-bold text-gray-900">{cat}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold text-indigo-600">
                          {count} {count === 1 ? 'سلعة' : 'سلع'}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center gap-1 justify-end">
                            {isEditingThis ? (
                              <>
                                <button
                                  onClick={() => {
                                    const trimmed = editingCategoryName.trim();
                                    if (!trimmed) return;
                                    if (trimmed === cat) {
                                      setEditingCategoryIndex(null);
                                      return;
                                    }
                                    if (categories.includes(trimmed)) {
                                      addToast?.('هذا الاسم موجود بالفعل لتصنيف آخر!', 'warning');
                                      return;
                                    }
                                    // Rename category in categories list
                                    setCategories(prev => prev.map((c, i) => i === idx ? trimmed : c));
                                    // Update category for all products belonging to it!
                                    products.forEach(p => {
                                      if (p.category === cat) {
                                        onEditProduct({ ...p, category: trimmed });
                                      }
                                    });
                                    setEditingCategoryIndex(null);
                                    addToast?.(`تم تغيير اسم التصنيف إلى "${trimmed}" وتحديث المنتجات المرتبطة به.`, 'success');
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={() => setEditingCategoryIndex(null)}
                                  className="px-2.5 py-1 bg-gray-150 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingCategoryIndex(idx);
                                    setEditingCategoryName(cat);
                                  }}
                                  className="p-1.5 hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
                                  title="تعديل اسم التصنيف"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setCategoryToDelete(cat)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                  title="حذف التصنيف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Delete Confirmation Overlay Modal */}
        {categoryToDelete && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in text-right">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center flex flex-col gap-4 max-h-[90%] overflow-y-auto">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">حذف قسم "{categoryToDelete}"؟</h4>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  هذا القسم يحتوي على <span className="font-mono font-bold text-indigo-600">{products.filter(p => p.category === categoryToDelete).length}</span> منتجات. هل أنت متأكد من حذف القسم؟ سيتم نقل كافة المنتجات التابعة له تلقائياً إلى قسم "أخرى".
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => {
                    const cat = categoryToDelete;
                    // Delete category from categories list
                    setCategories(prev => prev.filter(c => c !== cat));
                    // Check if 'أخرى' is in categories, if not, add it
                    setCategories(prev => {
                      if (!prev.includes('أخرى')) {
                        return [...prev, 'أخرى'];
                      }
                      return prev;
                    });
                    // Change category for all products belonging to it
                    products.forEach(p => {
                      if (p.category === cat) {
                        onEditProduct({ ...p, category: 'أخرى' });
                      }
                    });
                    setCategoryToDelete(null);
                    addToast?.(`تم حذف قسم "${cat}" ونقل منتجاته إلى قسم "أخرى".`, 'info');
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  نعم، حذف ونقل المنتجات
                </button>
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Overlay Modal */}
        {productToDelete && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center flex flex-col gap-4 max-h-[90%] overflow-y-auto">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">حذف السلعة نهائياً؟</h4>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  هل أنت متأكد من رغبتك بحذف السلعة <span className="font-semibold text-rose-600">"{productToDelete.name}"</span>؟ سيتم مسحها من الرفوف والمخزن بالكامل.
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => {
                    onDeleteProduct(productToDelete.id);
                    setProductToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Import / Excel Manager Overlay Modal */}
        {isCsvImportOpen && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ direction: 'rtl' }}>
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative flex flex-col gap-4 max-h-[90vh] overflow-hidden border border-slate-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setIsCsvImportOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">استيراد المنتجات من ملف Excel / CSV</h3>
                </div>
              </div>

              {/* Informative Banner and Template Download */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-right">
                  <span className="text-xs font-bold text-indigo-950 block">كيف يعمل الاستيراد الذكي؟</span>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed max-w-xl">
                    يمكنك كتابة بياناتك على Excel وتصديرها كملف CSV. سيقوم نظامنا بالتعرف التلقائي على الأعمدة (الاسم، الباركود، السعر، المخزون...)، وسيقوم بإنشاء باركود تلقائي أو تحديد الأقسام للسلع التي تفتقر إليها!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل نموذج Excel CSV</span>
                </button>
              </div>

              {/* File upload drag-and-drop zone */}
              {csvParsedItems.length === 0 ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setCsvFileDragging(true); }}
                  onDragLeave={() => setCsvFileDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setCsvFileDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleCSVFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => document.getElementById('csv-file-selector')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer min-h-[180px] ${
                    csvFileDragging 
                      ? 'border-indigo-500 bg-indigo-50/80 scale-[0.99]' 
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="file"
                    id="csv-file-selector"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCSVFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-800 block">اسحب وأسقط ملف CSV هنا</span>
                    <p className="text-[10.5px] text-slate-500 max-w-sm mx-auto">
                      أو انقر لتصفح جهازك واختيار ملف مخزون السلع المنسق. يرجى حفظ ملف إكسيل بصيغة (CSV UTF-8) لتفادي أخطاء الحروف العربية.
                    </p>
                  </div>
                </div>
              ) : (
                /* Parsed Items Preview & Settings Mode */
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  {/* File status and duplicate settings */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-bold text-slate-700">
                        تم رصد <span className="text-indigo-600 text-sm font-black font-mono">{csvParsedItems.length}</span> سلعة جاهزة للاستيراد
                      </span>
                    </div>

                    {/* Duplicate Action Config */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-bold text-slate-500">عند تكرار الباركود:</span>
                      <div className="flex bg-white p-0.5 border border-slate-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setCsvDuplicateAction('update')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            csvDuplicateAction === 'update' 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          تحديث السعر والكمية
                        </button>
                        <button
                          type="button"
                          onClick={() => setCsvDuplicateAction('skip')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            csvDuplicateAction === 'skip' 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          تجاهل وتخطي
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Column Mapping Checkers */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-slate-50/50 p-2 border border-slate-100 rounded-xl text-center">
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] text-slate-400 block font-bold">اسم السلعة</span>
                      <span className={`text-[10px] font-extrabold ${csvMappedHeaders.name !== -1 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {csvMappedHeaders.name !== -1 ? '✓ متطابق' : '✗ مفقود'}
                      </span>
                    </div>
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] text-slate-400 block font-bold">الباركود</span>
                      <span className={`text-[10px] font-extrabold ${csvMappedHeaders.barcode !== -1 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {csvMappedHeaders.barcode !== -1 ? '✓ متطابق' : 'توليد تلقائي ⚡'}
                      </span>
                    </div>
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] text-slate-400 block font-bold">القسم</span>
                      <span className={`text-[10px] font-extrabold ${csvMappedHeaders.category !== -1 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {csvMappedHeaders.category !== -1 ? '✓ متطابق' : 'افتراضي 📁'}
                      </span>
                    </div>
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] text-slate-400 block font-bold">سعر الشراء</span>
                      <span className={`text-[10px] font-extrabold ${csvMappedHeaders.costPrice !== -1 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {csvMappedHeaders.costPrice !== -1 ? '✓ متطابق' : '70% من البيع'}
                      </span>
                    </div>
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] text-slate-400 block font-bold">سعر البيع</span>
                      <span className={`text-[10px] font-extrabold ${csvMappedHeaders.price !== -1 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {csvMappedHeaders.price !== -1 ? '✓ متطابق' : '✗ مفقود'}
                      </span>
                    </div>
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] text-slate-400 block font-bold">المخزون</span>
                      <span className={`text-[10px] font-extrabold ${csvMappedHeaders.stock !== -1 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {csvMappedHeaders.stock !== -1 ? '✓ متطابق' : 'افتراضي 0'}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview Table */}
                  <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl bg-white max-h-[300px]">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-slate-100 z-10">
                        <tr>
                          <th className="px-4 py-2.5">اسم السلعة</th>
                          <th className="px-4 py-2.5">الباركود</th>
                          <th className="px-4 py-2.5">القسم</th>
                          <th className="px-4 py-2.5">سعر الشراء</th>
                          <th className="px-4 py-2.5">سعر البيع</th>
                          <th className="px-4 py-2.5 text-center">المخزون</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {csvParsedItems.slice(0, 15).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-bold text-slate-900">{item.name}</td>
                            <td className="px-4 py-2 font-mono text-slate-500">{item.barcode}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-[10px] rounded-full font-bold text-slate-600">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-600">{item.costPrice.toFixed(2)} ر.س</td>
                            <td className="px-4 py-2 font-mono text-slate-900 font-black">{item.price.toFixed(2)} ر.س</td>
                            <td className="px-4 py-2 text-center font-mono font-bold text-indigo-600">{item.stock}</td>
                          </tr>
                        ))}
                        {csvParsedItems.length > 15 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={6} className="px-4 py-2 text-center text-[11px] text-slate-400 font-semibold italic">
                              ... وهناك {csvParsedItems.length - 15} سلعة أخرى متواجدة بالملف سيتم استيرادها بالكامل.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCsvParsedItems([])}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center active:scale-95"
                    >
                      إلغاء وتغيير الملف
                    </button>
                    <button
                      type="button"
                      onClick={executeCSVImport}
                      className="flex-2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 active:scale-95 font-sans"
                    >
                      <Check className="w-4 h-4" />
                      <span>تأكيد واستيراد {csvParsedItems.length} منتج للمخزن</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Import status success overlay log */}
              {csvImportLog && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 p-6 text-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg">تم استيراد المخزون بنجاح! 🎉</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed">
                      تم فحص وتدقيق الملف وإدخاله لقاعدة بيانات الكاشير والمخزون.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-2">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-emerald-800 block">سلع جديدة مضافة</span>
                      <span className="text-2xl font-black font-mono text-emerald-600 block mt-1">{csvImportLog.success}</span>
                    </div>
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-indigo-800 block">سلع تم تحديثها</span>
                      <span className="text-2xl font-black font-mono text-indigo-600 block mt-1">{csvImportLog.updated}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block animate-pulse mt-2">جاري إغلاق هذه النافذة وتحديث المخزون...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
