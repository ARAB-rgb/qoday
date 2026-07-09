import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client safely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

  // API Route for AI product generation
  app.post("/api/gemini/generate-products", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "الرجاء إدخال الوصف لتوليد المنتجات" });
      }

      if (!ai) {
        console.warn("GEMINI_API_KEY is not defined. Falling back to intelligent local mock generator.");
        const mockProducts = generateIntelligentMockProducts(prompt);
        return res.json({ products: mockProducts, isDemo: true });
      }

      const systemInstruction = `أنت خبير محترف في إدارة المخزون وتصنيف سلع السوبرماركت والبقالات في المملكة العربية السعودية. 
قم بتوليد قائمة تتراوح بين 3 إلى 6 منتجات سعودية واقعية تناسب طلب المستخدم بالتفصيل وبشكل دقيق جداً.
شروط هامة:
1. الباركود (barcode) يجب أن يكون مكوناً من 13 رقماً ويبدأ بـ '628' (مفتاح السعودية للترميز التجاري، مثل 6281100000012) ويكون فريداً تماماً.
2. التصنيف (category) يجب أن يكون حصراً واحداً من التصنيفات التالية:
   - 'الألبان والأجبان'
   - 'المشروبات'
   - 'المخبوزات'
   - 'المعلبات'
   - 'الخضار والفواكه'
   - 'السكاكر والحلويات'
   - 'مواد التنظيف'
   - 'أخرى'
3. سعر الشراء (costPrice) يجب أن يكون أقل من سعر البيع (price) بفرق منطقي يمثل هامش ربح يتراوح بين 15% إلى 35%.
4. الأسماء باللغة العربية بأسلوب تسويقي وتجاري متداول في السوق السعودي (مثال: "قشطة بوك 170 غرام"، "بسكويت دايجستف لايت 250ج").
5. تحديد كميات مخزون (stock) أولية واقعية مثل (10 إلى 80 حبة).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `أريد توليد منتجات للبقالة بناء على الوصف التالي: "${prompt}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "قائمة المنتجات المقترحة للبقالة",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "اسم المنتج بالتفصيل وحجمه/وزنه باللغة العربية" },
                price: { type: Type.NUMBER, description: "سعر بيع المنتج النهائي للمستهلك بالريال السعودي (ر.س)" },
                costPrice: { type: Type.NUMBER, description: "سعر شراء المنتج (تكلفة الجملة) بالريال السعودي (ر.س)" },
                barcode: { type: Type.STRING, description: "الرمز الشريطي المكون من 13 خانة تبدأ بـ 628" },
                category: { type: Type.STRING, description: "تصنيف المنتج الدقيق من الخيارات المحددة فقط" },
                stock: { type: Type.INTEGER, description: "الكمية الأولية المتوفرة في المخزن" }
              },
              required: ["name", "price", "costPrice", "barcode", "category", "stock"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      const generatedProducts = JSON.parse(text);
      return res.json({ products: generatedProducts, isDemo: false });

    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      const fallbackProducts = generateIntelligentMockProducts(req.body?.prompt || "");
      return res.json({ 
        products: fallbackProducts, 
        isDemo: true, 
        warning: "حدثت مشكلة أثناء الاتصال بـ Gemini، تم توليد منتجات محاكاة ذكية بديلة." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function generateIntelligentMockProducts(prompt: string): any[] {
  const promptLower = prompt.toLowerCase();
  
  const templates = [
    {
      keywords: ["حليب", "لبن", "جبن", "قشطة", "زبادي", "ألبان", "dairy", "cheese"],
      products: [
        { name: "حليب نادك كامل الدسم 2 لتر", price: 11.00, costPrice: 8.50, category: "الألبان والأجبان", stock: 30 },
        { name: "جبنة بوك كاسات بيضاء 500غ", price: 17.50, costPrice: 13.00, category: "الألبان والأجبان", stock: 24 },
        { name: "لبنة بينار تركي طازجة 400غ", price: 14.25, costPrice: 11.00, category: "الألبان والأجبان", stock: 15 },
        { name: "قشطة المراعي طازجة 100غ", price: 4.50, costPrice: 3.20, category: "الألبان والأجبان", stock: 40 }
      ]
    },
    {
      keywords: ["عصير", "ماء", "مياه", "مشروب", "غازي", "كولا", "بيبسي", "drink", "juice", "soda"],
      products: [
        { name: "عصير المراعي برتقال طازج 1.5 لتر", price: 12.00, costPrice: 9.00, category: "المشروبات", stock: 25 },
        { name: "مشروب غازي بيبسي عائلي 2.25 لتر", price: 9.50, costPrice: 7.20, category: "المشروبات", stock: 35 },
        { name: "مياه أكوافينا كرتون 30 حبة * 330 مل", price: 15.00, costPrice: 11.50, category: "المشروبات", stock: 50 },
        { name: "شاي ريد ليبل أكياس 100 كيس", price: 16.50, costPrice: 12.00, category: "المشروبات", stock: 20 }
      ]
    },
    {
      keywords: ["خبز", "توست", "صامولي", "شابورة", "كيك", "مخبوزات", "bakery", "bread"],
      products: [
        { name: "توست لوزين أبيض عائلي", price: 5.00, costPrice: 3.80, category: "المخبوزات", stock: 18 },
        { name: "كرواسون جونيور سفن دايز شوكولاتة", price: 1.50, costPrice: 1.00, category: "المخبوزات", stock: 40 },
        { name: "كاب كيك لوزين فانيليا 12 حبة", price: 10.00, costPrice: 7.50, category: "المخبوزات", stock: 12 },
        { name: "خبز مفرود بر كامل هرفي", price: 2.00, costPrice: 1.40, category: "المخبوزات", stock: 30 }
      ]
    },
    {
      keywords: ["صابون", "تايد", "كلوركس", "فيري", "تنظيف", "ديتول", "clean"],
      products: [
        { name: "سائل جلي فيري ليمون 1 لتر", price: 14.50, costPrice: 11.00, category: "مواد التنظيف", stock: 15 },
        { name: "مطهر ديتول سائل 500 مل", price: 22.00, costPrice: 17.50, category: "مواد التنظيف", stock: 10 },
        { name: "مطهر كلوركس سائل أصلي 1 جالون", price: 19.00, costPrice: 14.50, category: "مواد التنظيف", stock: 12 }
      ]
    },
    {
      keywords: ["شيبس", "بسكويت", "شوكولاتة", "حلويات", "كاندي", "سويت", "sweet", "candy"],
      products: [
        { name: "بسكويت بالسمسم أولكر 12 حبة", price: 12.00, costPrice: 8.50, category: "السكاكر والحلويات", stock: 30 },
        { name: "شوكولاتة جالاكسي بالبندق 80غ", price: 6.00, costPrice: 4.20, category: "السكاكر والحلويات", stock: 45 },
        { name: "بسكويت أوريو مغطى بالشوكولاتة", price: 3.50, costPrice: 2.40, category: "السكاكر والحلويات", stock: 50 }
      ]
    }
  ];

  let matchedProducts: any[] = [];
  for (const item of templates) {
    if (item.keywords.some(k => promptLower.includes(k))) {
      matchedProducts = item.products;
      break;
    }
  }

  if (matchedProducts.length === 0) {
    matchedProducts = [
      { name: `تونة قودي خفيف بالزيت 185غ`, price: 8.50, costPrice: 6.00, category: "المعلبات", stock: 24 },
      { name: `معكرونة قودي سباغيتي 500غ`, price: 5.75, costPrice: 4.10, category: "المعلبات", stock: 30 },
      { name: `كاتشب طماطم ليبنز عبوة ضاغطة`, price: 13.00, costPrice: 9.50, category: "المعلبات", stock: 15 },
      { name: `كورن فليكس كلوقز الأصلي 375غ`, price: 19.50, costPrice: 14.80, category: "أخرى", stock: 12 }
    ];
  }

  return matchedProducts.map((p) => {
    const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const barcode = "628" + randomSuffix.slice(0, 10);
    return {
      ...p,
      name: p.name.includes(prompt) ? p.name : `${p.name} (${prompt})`,
      barcode
    };
  });
}

startServer();
