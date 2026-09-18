import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";


dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Supabase Client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  // Helper to detect table not found errors gracefully from Supabase
  const isTableNotFoundError = (error: any) => {
    if (!error) return false;
    const msg = (error.message || "").toLowerCase();
    return (
      error.code === "42P01" ||
      msg.includes("could not find the table") ||
      msg.includes("relation") && msg.includes("does not exist") ||
      msg.includes("schema cache")
    );
  };

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

  // --- IN-MEMORY SUPER ADMIN DATABASE ---
  const JWT_SECRET = process.env.SUPER_ADMIN_JWT_SECRET || "super_admin_secret_key_9988_qayd";

  let superAdminCompanies = [
    {
      id: "comp-1",
      name: "مؤسسة قيد التجارية",
      vatNumber: "300055443300003",
      crNumber: "1010000000",
      vatRate: 15,
      welcomeMsg: "نشكركم لتسوقكم معنا في مؤسسة قيد التجارية (QAYD)!",
      subscriptionPlan: "premium",
      subscriptionExpiry: "2027-01-01",
      maxProductsLimit: 100,
      isActive: true,
      barcode: "6281010000010"
    },
    {
      id: "comp-2",
      name: "بقالة السنبلة والخضار",
      vatNumber: "310123456700003",
      crNumber: "1010222333",
      vatRate: 15,
      welcomeMsg: "مرحباً بكم في بقالة السنبلة والخضار الطازجة!",
      subscriptionPlan: "basic",
      subscriptionExpiry: "2026-10-15",
      maxProductsLimit: 50,
      isActive: true,
      barcode: "6281010000027"
    },
    {
      id: "comp-3",
      name: "تموينات النخبة للمواد الغذائية",
      vatNumber: "320987654300003",
      crNumber: "1010999888",
      vatRate: 15,
      welcomeMsg: "نشكر ثقتكم بنا في تموينات النخبة!",
      subscriptionPlan: "enterprise",
      subscriptionExpiry: "2026-12-31",
      maxProductsLimit: 1000,
      isActive: true,
      barcode: "6281010000034"
    },
    {
      id: "comp-4",
      name: "كافيه ومخبز ركن الحارة",
      vatNumber: "330555666700003",
      crNumber: "1010444555",
      vatRate: 15,
      welcomeMsg: "عوافي عليكم من كافيه ومخبز ركن الحارة!",
      subscriptionPlan: "free",
      subscriptionExpiry: "2026-05-01",
      maxProductsLimit: 5,
      isActive: false,
      barcode: "6281010000041"
    }
  ];

  let superAdminUsers = [
    { id: "user-1", name: "أحمد القحطاني", username: "ahmad_admin", role: "admin", companyId: "comp-1", companyName: "مؤسسة قيد التجارية", status: "active", lastLogin: "قبل ساعتين" },
    { id: "user-2", name: "سارة الدوسري", username: "sara_cashier", role: "cashier", companyId: "comp-1", companyName: "مؤسسة قيد التجارية", status: "active", lastLogin: "قبل 4 ساعات" },
    { id: "user-3", name: "خالد الحربي", username: "khaled_admin", role: "admin", companyId: "comp-2", companyName: "بقالة السنبلة والخضار", status: "active", lastLogin: "يوم أمس" },
    { id: "user-4", name: "فاطمة العتيبي", username: "fatimah_cashier", role: "cashier", companyId: "comp-2", companyName: "بقالة السنبلة والخضار", status: "active", lastLogin: "قبل 3 أيام" },
    { id: "user-5", name: "محمد السديري", username: "mohammed_admin", role: "admin", companyId: "comp-3", companyName: "تموينات النخبة للمواد الغذائية", status: "active", lastLogin: "قبل ساعة" },
    { id: "user-6", name: "عبدالرحمن الشهري", username: "abdul_cashier", role: "cashier", companyId: "comp-4", companyName: "كافيه ومخبز ركن الحارة", status: "suspended", lastLogin: "قبل شهرين" }
  ];

  let superAdminLogs = [
    { id: "log-1", action: "تأسيس وتشغيل لوحة تحكم Super Admin بنجاح", user: "نظام قيد", timestamp: Date.now() - 3600000 * 2 },
    { id: "log-2", action: "تعديل حالة شركة 'كافيه ومخبز ركن الحارة' إلى: موقوف بسبب انتهاء الاشتراك", user: "نظام قيد تلقائي", timestamp: Date.now() - 3600000 * 12 },
    { id: "log-3", action: "ترقية باقة 'تموينات النخبة للمواد الغذائية' إلى الباقة غير المحدودة (Enterprise)", user: "الدعم الفني للقيد", timestamp: Date.now() - 3600000 * 24 }
  ];

  let superAdminSettings = {
    maintenanceMode: false,
    supportEmail: "support@qayd.sa",
    supportPhone: "+966556446888",
    defaultTrialDays: 14,
    defaultVatRate: 15,
    backupFrequency: "daily"
  };

  const getSuperAdminStats = () => {
    const totalCompanies = superAdminCompanies.length;
    const activeSubscribers = superAdminCompanies.filter(c => c.isActive && c.subscriptionPlan !== 'free').length;
    const totalUsers = superAdminUsers.length;
    
    // Calculate Monthly Revenue based on plans
    let monthlyRevenue = 0;
    superAdminCompanies.forEach(c => {
      if (c.isActive) {
        if (c.subscriptionPlan === 'basic') monthlyRevenue += 99;
        if (c.subscriptionPlan === 'premium') monthlyRevenue += 299;
        if (c.subscriptionPlan === 'enterprise') monthlyRevenue += 999;
      }
    });

    const totalInvoices = 1420;

    return {
      totalCompanies,
      activeSubscribers,
      totalUsers,
      monthlyRevenue,
      totalInvoices
    };
  };

  // Super Admin Authenticator Middleware
  const authenticateSuperAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "الرجاء توفير رمز المصادقة الصالح (Bearer Token)" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.superAdmin = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "جلسة منتهية الصلاحية أو غير صالحة. الرجاء إعادة تسجيل الدخول" });
    }
  };

  // 1. Super Admin Login (returns JWT)
  app.post("/api/super-admin/login", (req, res) => {
    const { username, password } = req.body;
    const expectedUsername = process.env.SUPER_ADMIN_USERNAME || "1007363904";
    const expectedPassword = process.env.SUPER_ADMIN_PASSWORD || "139213";

    if (username === expectedUsername && password === expectedPassword) {
      const token = jwt.sign(
        { role: "super-admin", username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      superAdminLogs.unshift({
        id: "log-" + Date.now(),
        action: "تسجيل دخول ناجح للوحة التحكم الكاملة للـ Super Admin",
        user: username,
        timestamp: Date.now()
      });

      return res.json({
        success: true,
        token,
        user: { username, role: "Super Admin" }
      });
    }

    superAdminLogs.unshift({
      id: "log-" + Date.now(),
      action: `محاولة تسجيل دخول فاشلة كـ Super Admin باسم المستخدم: ${username || 'غير معروف'}`,
      user: "غير معروف",
      timestamp: Date.now()
    });

    return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  });

  // 2. Fetch Dashboard Data
  app.get("/api/super-admin/dashboard-data", authenticateSuperAdmin, (req, res) => {
    res.json({
      success: true,
      stats: getSuperAdminStats(),
      companies: superAdminCompanies,
      users: superAdminUsers,
      logs: superAdminLogs,
      settings: superAdminSettings
    });
  });

  // 3. Create Company
  app.post("/api/super-admin/companies", authenticateSuperAdmin, (req, res) => {
    const { name, vatNumber, crNumber, vatRate, welcomeMsg, subscriptionPlan, subscriptionExpiry, barcode } = req.body;
    if (!name) {
      return res.status(400).json({ error: "اسم الشركة مطلوب" });
    }

    const generatedBarcode = barcode || `628${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newCompany = {
      id: "comp-" + Date.now(),
      name,
      vatNumber: vatNumber || "",
      crNumber: crNumber || "",
      vatRate: Number(vatRate) || 15,
      welcomeMsg: welcomeMsg || `نشكركم لتسوقكم معنا في ${name}!`,
      subscriptionPlan: subscriptionPlan || "free",
      subscriptionExpiry: subscriptionExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxProductsLimit: subscriptionPlan === "free" ? 5 : subscriptionPlan === "basic" ? 50 : subscriptionPlan === "premium" ? 100 : 1000,
      isActive: true,
      barcode: generatedBarcode
    };

    superAdminCompanies.push(newCompany);

    superAdminUsers.push({
      id: "user-" + Date.now(),
      name: `مشرف ${name}`,
      username: `admin_${newCompany.id}`,
      role: "admin",
      companyId: newCompany.id,
      companyName: name,
      status: "active",
      lastLogin: "لم يسجل بعد"
    });

    superAdminLogs.unshift({
      id: "log-" + Date.now(),
      action: `إنشاء شركة جديدة: ${name} وبدء اشتراكها بـ ${subscriptionPlan} (باركود #${generatedBarcode})`,
      user: "Super Admin",
      timestamp: Date.now()
    });

    res.json({ success: true, company: newCompany });
  });

  // 4. Update Company
  app.put("/api/super-admin/companies/:id", authenticateSuperAdmin, (req, res) => {
    const { id } = req.params;
    const { name, vatNumber, crNumber, vatRate, welcomeMsg, subscriptionPlan, subscriptionExpiry, isActive, barcode } = req.body;

    const companyIndex = superAdminCompanies.findIndex(c => c.id === id);
    if (companyIndex === -1) {
      return res.status(404).json({ error: "الشركة غير موجودة" });
    }

    const existing = superAdminCompanies[companyIndex];
    const updated = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      vatNumber: vatNumber !== undefined ? vatNumber : existing.vatNumber,
      crNumber: crNumber !== undefined ? crNumber : existing.crNumber,
      vatRate: vatRate !== undefined ? Number(vatRate) : existing.vatRate,
      welcomeMsg: welcomeMsg !== undefined ? welcomeMsg : existing.welcomeMsg,
      subscriptionPlan: subscriptionPlan !== undefined ? subscriptionPlan : existing.subscriptionPlan,
      subscriptionExpiry: subscriptionExpiry !== undefined ? subscriptionExpiry : existing.subscriptionExpiry,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      barcode: barcode !== undefined ? barcode : existing.barcode,
      maxProductsLimit: subscriptionPlan !== undefined ? 
        (subscriptionPlan === "free" ? 5 : subscriptionPlan === "basic" ? 50 : subscriptionPlan === "premium" ? 100 : 1000) 
        : existing.maxProductsLimit
    };

    superAdminCompanies[companyIndex] = updated;

    let logMsg = `تعديل إعدادات الشركة '${existing.name}'`;
    if (subscriptionPlan && subscriptionPlan !== existing.subscriptionPlan) {
      logMsg += ` - تغيير الباقة إلى: ${subscriptionPlan}`;
    }
    if (subscriptionExpiry && subscriptionExpiry !== existing.subscriptionExpiry) {
      logMsg += ` - تمديد الاشتراك إلى: ${subscriptionExpiry}`;
    }
    if (isActive !== undefined && isActive !== existing.isActive) {
      logMsg += ` - تغيير حالة التفعيل إلى: ${isActive ? 'نشط' : 'موقوف'}`;
    }

    superAdminLogs.unshift({
      id: "log-" + Date.now(),
      action: logMsg,
      user: "Super Admin",
      timestamp: Date.now()
    });

    res.json({ success: true, company: updated });
  });

  // 4b. Delete Company
  app.delete("/api/super-admin/companies/:id", authenticateSuperAdmin, (req, res) => {
    const { id } = req.params;

    const companyIndex = superAdminCompanies.findIndex(c => c.id === id);
    if (companyIndex === -1) {
      return res.status(404).json({ error: "الشركة غير موجودة" });
    }

    const company = superAdminCompanies[companyIndex];
    superAdminCompanies.splice(companyIndex, 1);

    // clean up users belonging to this company
    const initialUserCount = superAdminUsers.length;
    superAdminUsers = superAdminUsers.filter(u => u.companyId !== id);
    const deletedUserCount = initialUserCount - superAdminUsers.length;

    superAdminLogs.unshift({
      id: "log-" + Date.now(),
      action: `حذف الشركة '${company.name}' بالكامل مع كافة المستخدمين التابعين لها (${deletedUserCount} مستخدم)`,
      user: "Super Admin",
      timestamp: Date.now()
    });

    res.json({ success: true, message: `تم حذف الشركة '${company.name}' بنجاح` });
  });

  // 5. Reset User Password
  app.post("/api/super-admin/users/reset-password", authenticateSuperAdmin, (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: "معرف المستخدم وكلمة المرور الجديدة مطلوبان" });
    }

    const user = superAdminUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    superAdminLogs.unshift({
      id: "log-" + Date.now(),
      action: `إعادة تعيين كلمة مرور المستخدم '${user.name}' بنجاح`,
      user: "Super Admin",
      timestamp: Date.now()
    });

    res.json({ success: true, message: `تمت إعادة تعيين كلمة مرور المستخدم ${user.name} بنجاح` });
  });

  // 6. Update global system settings
  app.put("/api/super-admin/settings", authenticateSuperAdmin, (req, res) => {
    const { maintenanceMode, supportEmail, supportPhone, defaultTrialDays, defaultVatRate, backupFrequency } = req.body;

    superAdminSettings = {
      maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : superAdminSettings.maintenanceMode,
      supportEmail: supportEmail || superAdminSettings.supportEmail,
      supportPhone: supportPhone || superAdminSettings.supportPhone,
      defaultTrialDays: defaultTrialDays !== undefined ? Number(defaultTrialDays) : superAdminSettings.defaultTrialDays,
      defaultVatRate: defaultVatRate !== undefined ? Number(defaultVatRate) : superAdminSettings.defaultVatRate,
      backupFrequency: backupFrequency || superAdminSettings.backupFrequency
    };

    superAdminLogs.unshift({
      id: "log-" + Date.now(),
      action: "تحديث إعدادات النظام الرئيسية بواسطة Super Admin",
      user: "Super Admin",
      timestamp: Date.now()
    });

    res.json({ success: true, settings: superAdminSettings });
  });

  // 7. Get specific company status (Public/POS helper)
  app.get("/api/companies/status/:id", (req, res) => {
    const { id } = req.params;
    const company = superAdminCompanies.find(c => c.id === id);
    if (!company) {
      return res.json({ exists: false, isActive: false });
    }
    res.json({ 
      exists: true, 
      isActive: company.isActive !== false, 
      subscriptionPlan: company.subscriptionPlan, 
      subscriptionExpiry: company.subscriptionExpiry 
    });
  });

  // --- Supabase proxy API endpoints ---
  
  app.get("/api/supabase/config", (req, res) => {
    res.json({
      configured: !!supabase,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : undefined
    });
  });

  // Fetch all companies from Supabase
  app.get("/api/supabase/companies", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase integration is not configured." });
    }
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        if (isTableNotFoundError(error)) {
          return res.status(404).json({ errorType: "TABLE_NOT_FOUND", table: "companies" });
        }
        throw error;
      }

      const mapped = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        vatNumber: c.vat_number || "",
        crNumber: c.cr_number || "",
        vatRate: Number(c.vat_rate || 15),
        welcomeMsg: c.welcome_msg || "",
        subscriptionPlan: c.subscription_plan || "free",
        subscriptionExpiry: c.subscription_expiry || "",
        maxProductsLimit: Number(c.max_products_limit || 5)
      }));

      res.json({ success: true, companies: mapped });
    } catch (err: any) {
      console.error("Fetch Companies Error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch companies" });
    }
  });

  // Sync / Upsert companies to Supabase
  app.post("/api/supabase/sync-companies", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase integration is not configured." });
    }
    try {
      const { companies } = req.body;
      if (!Array.isArray(companies)) {
        return res.status(400).json({ error: "Invalid companies list format." });
      }

      const dbCompanies = companies.map(c => ({
        id: c.id,
        name: c.name,
        vat_number: c.vatNumber,
        cr_number: c.crNumber,
        vat_rate: c.vatRate,
        welcome_msg: c.welcomeMsg,
        subscription_plan: c.subscriptionPlan,
        subscription_expiry: c.subscriptionExpiry,
        max_products_limit: c.maxProductsLimit
      }));

      const { error } = await supabase
        .from("companies")
        .upsert(dbCompanies);

      if (error) {
        if (isTableNotFoundError(error)) {
          return res.status(404).json({ errorType: "TABLE_NOT_FOUND", table: "companies" });
        }
        throw error;
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("Sync Companies Error:", err);
      res.status(500).json({ error: err.message || "Failed to sync companies" });
    }
  });

  // Fetch products for a specific company
  app.get("/api/supabase/products", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase integration is not configured." });
    }
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== "string") {
      return res.status(400).json({ error: "companyId query parameter is required." });
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("company_id", companyId);

      if (error) {
        if (isTableNotFoundError(error)) {
          return res.status(404).json({ errorType: "TABLE_NOT_FOUND", table: "products" });
        }
        throw error;
      }

      const mapped = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        costPrice: Number(p.cost_price || 0),
        barcode: p.barcode || "",
        category: p.category || "",
        stock: Number(p.stock || 0),
        isUnavailable: p.is_unavailable || false
      }));

      res.json({ success: true, products: mapped });
    } catch (err: any) {
      console.error("Fetch Products Error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch products" });
    }
  });

  // Sync / Upsert products for a specific company
  app.post("/api/supabase/sync-products", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase integration is not configured." });
    }
    const { products, companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required." });
    }
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid products array format." });
    }

    try {
      const dbProducts = products.map(p => ({
        id: p.id,
        company_id: companyId,
        name: p.name,
        price: p.price,
        cost_price: p.costPrice || 0,
        barcode: p.barcode || "",
        category: p.category || "",
        stock: p.stock || 0,
        is_unavailable: p.isUnavailable || false
      }));

      // In order to perform a clean sync, we can delete products that are no longer present
      // or simply upsert what is sent. Since POS state in frontend is authoritative,
      // we can do a standard delete + upsert transaction, or simply upsert. Let's do delete not in list + upsert.
      const productIds = dbProducts.map(p => p.id);
      
      // Delete products belonging to this company that are no longer in this list
      if (productIds.length > 0) {
        await supabase
          .from("products")
          .delete()
          .eq("company_id", companyId)
          .not("id", "in", `(${productIds.join(",")})`);
      } else {
        await supabase
          .from("products")
          .delete()
          .eq("company_id", companyId);
      }

      if (dbProducts.length > 0) {
        const { error } = await supabase
          .from("products")
          .upsert(dbProducts);

        if (error) {
          if (isTableNotFoundError(error)) {
            return res.status(404).json({ errorType: "TABLE_NOT_FOUND", table: "products" });
          }
          throw error;
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("Sync Products Error:", err);
      res.status(500).json({ error: err.message || "Failed to sync products" });
    }
  });

  // Fetch orders for a specific company
  app.get("/api/supabase/orders", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase integration is not configured." });
    }
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== "string") {
      return res.status(400).json({ error: "companyId query parameter is required." });
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("company_id", companyId);

      if (error) {
        if (isTableNotFoundError(error)) {
          return res.status(404).json({ errorType: "TABLE_NOT_FOUND", table: "orders" });
        }
        throw error;
      }

      const mapped = (data || []).map(o => ({
        id: o.id,
        customerName: o.customer_name || undefined,
        items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
        total: Number(o.total || 0),
        vatAmount: Number(o.vat_amount || 0),
        discount: Number(o.discount || 0),
        paymentMethod: o.payment_method,
        status: o.status,
        createdAt: o.created_at
      }));

      res.json({ success: true, orders: mapped });
    } catch (err: any) {
      console.error("Fetch Orders Error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch orders" });
    }
  });

  // Sync / Upsert orders for a specific company
  app.post("/api/supabase/sync-orders", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase integration is not configured." });
    }
    const { orders, companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required." });
    }
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: "Invalid orders array format." });
    }

    try {
      const dbOrders = orders.map(o => ({
        id: o.id,
        company_id: companyId,
        customer_name: o.customerName || null,
        items: o.items, // JSONB supports direct objects/arrays
        total: o.total,
        vat_amount: o.vatAmount,
        discount: o.discount,
        payment_method: o.paymentMethod,
        status: o.status,
        created_at: o.createdAt
      }));

      if (dbOrders.length > 0) {
        const { error } = await supabase
          .from("orders")
          .upsert(dbOrders);

        if (error) {
          if (isTableNotFoundError(error)) {
            return res.status(404).json({ errorType: "TABLE_NOT_FOUND", table: "orders" });
          }
          throw error;
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("Sync Orders Error:", err);
      res.status(500).json({ error: err.message || "Failed to sync orders" });
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
