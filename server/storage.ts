import { User, Customer, Appointment, Staff, InsertUser, InsertCustomer, InsertAppointment, InsertStaff, MarketingCampaign, InsertMarketingCampaign, Promotion, InsertPromotion, DiscountCode, InsertDiscountCode, SocialMediaAccount, InsertSocialMediaAccount, Product, ProductGroup, InsertProduct, InsertProductGroup, Invoice, InsertInvoice } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { Supplier, InsertSupplier, PurchaseOrder, InsertPurchaseOrder, PurchaseItem, InsertPurchaseItem } from "@shared/schema";
import { ExpenseCategory, InsertExpenseCategory, Expense, InsertExpense } from "@shared/schema";

interface Setting {
    id: number;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

interface StoreSetting {
    id: number;
    storeName: string;
    storeLogo: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;

  // Staff operations
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;
  setSetting(key: string, value: string): Promise<Setting>;

  // Marketing Campaign operations
  getCampaigns(): Promise<MarketingCampaign[]>;
  getCampaign(id: number): Promise<MarketingCampaign | undefined>;
  createCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign>;
  updateCampaign(id: number, campaign: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign>;
  deleteCampaign(id: number): Promise<void>;

  // Promotion operations
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: number): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  deletePromotion(id: number): Promise<void>;

  // Discount Code operations
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCode(id: number): Promise<DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: number, code: Partial<InsertDiscountCode>): Promise<DiscountCode>;
  deleteDiscountCode(id: number): Promise<void>;

  // Social Media Account operations
  getSocialMediaAccounts(): Promise<SocialMediaAccount[]>;
  getSocialMediaAccount(id: number): Promise<SocialMediaAccount | undefined>;
  createSocialMediaAccount(account: InsertSocialMediaAccount): Promise<SocialMediaAccount>;
  updateSocialMediaAccount(id: number, account: Partial<InsertSocialMediaAccount>): Promise<SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;

  // Product Group operations
  getProductGroups(): Promise<ProductGroup[]>;
  getProductGroup(id: number): Promise<ProductGroup | undefined>;
  createProductGroup(group: InsertProductGroup): Promise<ProductGroup>;
  updateProductGroup(id: number, group: Partial<InsertProductGroup>): Promise<ProductGroup>;
  deleteProductGroup(id: number): Promise<void>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;

  sessionStore: session.Store;
    // Store Settings operations
    getStoreSettings(): Promise<StoreSetting | undefined>;
    updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<StoreSetting>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;

  // Purchase operations
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(purchase: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, purchase: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder>;
  deletePurchaseOrder(id: number): Promise<void>;
  getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]>;

  // Expense Category operations
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory>;
  deleteExpenseCategory(id: number): Promise<void>;

  // Expense operations
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private appointments: Map<number, Appointment>;
  private staff: Map<number, Staff>;
  private currentId: number;
  private settings: Map<string, Setting>;
  private campaigns: Map<number, MarketingCampaign>;
  private promotions: Map<number, Promotion>;
  private discountCodes: Map<number, DiscountCode>;
  private socialMediaAccounts: Map<number, SocialMediaAccount>;
  private products: Map<number, Product>;
  private productGroups: Map<number, ProductGroup>;
  private invoices: Map<number, Invoice>;
  private storeSettings: StoreSetting | undefined;
  private suppliers: Map<number, Supplier>;
  private purchaseOrders: Map<number, PurchaseOrder>;
  private purchaseItems: Map<number, PurchaseItem[]>;
  private expenseCategories: Map<number, ExpenseCategory>;
  private expenses: Map<number, Expense>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.appointments = new Map();
    this.staff = new Map();
    this.settings = new Map();
    this.campaigns = new Map();
    this.promotions = new Map();
    this.discountCodes = new Map();
    this.socialMediaAccounts = new Map();
    this.products = new Map();
    this.productGroups = new Map();
    this.invoices = new Map();
    this.suppliers = new Map();
    this.purchaseOrders = new Map();
    this.purchaseItems = new Map();
    this.expenseCategories = new Map();
    this.expenses = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add sample marketing campaigns
    this.campaigns.set(1, {
      id: 1,
      name: "حملة الصيف على فيسبوك",
      description: "عروض خاصة لموسم الصيف",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-07-01"),
      status: "active",
      type: "facebook",
      content: "اكتشف عروضنا المميزة لموسم الصيف! خصومات تصل إلى 50%",
      platforms: ["facebook"],
      budget: 50000, // 500 SAR
      messageCount: 245, // تفاعلات وردود
      targetAudience: JSON.stringify({
        age: "18-35",
        gender: "all",
        location: "الرياض",
        interests: ["تسوق", "موضة"]
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.campaigns.set(2, {
      id: 2,
      name: "حملة رمضان على انستغرام",
      description: "عروض شهر رمضان المبارك",
      startDate: new Date("2025-03-11"),
      endDate: new Date("2025-04-09"),
      status: "draft",
      type: "instagram",
      content: "استعد لشهر رمضان مع أفضل العروض والخصومات",
      platforms: ["instagram"],
      budget: 100000, // 1000 SAR
      messageCount: 412, // تفاعلات وردود
      targetAudience: JSON.stringify({
        age: "25-55",
        gender: "all",
        location: "المملكة العربية السعودية",
        interests: ["طبخ", "تسوق", "ديكور"]
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.campaigns.set(3, {
      id: 3,
      name: "حملة نهاية الأسبوع على سناب شات",
      description: "عروض خاصة لنهاية الأسبوع",
      startDate: new Date("2025-02-20"),
      endDate: new Date("2025-02-23"),
      status: "completed",
      type: "snapchat",
      content: "عروض حصرية لمتابعينا على سناب شات",
      platforms: ["snapchat"],
      budget: 30000, // 300 SAR
      messageCount: 178, // تفاعلات وردود
      targetAudience: JSON.stringify({
        age: "16-24",
        gender: "all",
        location: "جدة",
        interests: ["ترفيه", "تسوق"]
      }),
      createdAt: new Date("2025-02-19"),
      updatedAt: new Date("2025-02-23")
    });

    // Add sample product groups
    this.productGroups.set(1, {
      id: 1,
      name: "مواد غذائية",
      description: "منتجات غذائية متنوعة",
      createdAt: new Date(),
    });

    this.productGroups.set(2, {
      id: 2,
      name: "منظفات",
      description: "مواد التنظيف",
      createdAt: new Date(),
    });

    // Add sample expense categories
    this.expenseCategories.set(1, {
      id: 1,
      name: "رواتب",
      description: "رواتب الموظفين",
      createdAt: new Date()
    });

    this.expenseCategories.set(2, {
      id: 2,
      name: "إيجارات",
      description: "إيجارات المحلات والمكاتب",
      createdAt: new Date()
    });

    this.expenseCategories.set(3, {
      id: 3,
      name: "مرافق",
      description: "كهرباء، ماء، إنترنت",
      createdAt: new Date()
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, role: "staff" };
    this.users.set(id, user);
    return user;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const newCustomer: Customer = {
      ...customer,
      id,
      email: customer.email || null,
      notes: customer.notes || null,
      createdAt: new Date()
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    const customer = await this.getCustomer(id);
    if (!customer) throw new Error("Customer not found");
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    this.customers.delete(id);
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const newAppointment: Appointment = {
      ...appointment,
      id,
      status: appointment.status || 'scheduled',
      notes: appointment.notes || null
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) throw new Error("Appointment not found");
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointments.delete(id);
  }

  // Staff operations
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async getStaffMember(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(staff: InsertStaff): Promise<Staff> {
    const id = this.currentId++;
    const newStaff: Staff = {
      ...staff,
      id,
      specialization: staff.specialization || null,
      workDays: staff.workDays || null,
      workHours: staff.workHours || null
    };
    this.staff.set(id, newStaff);
    return newStaff;
  }

  async updateStaff(id: number, updates: Partial<InsertStaff>): Promise<Staff> {
    const staff = await this.getStaffMember(id);
    if (!staff) throw new Error("Staff member not found");
    const updatedStaff = { ...staff, ...updates };
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<void> {
    this.staff.delete(id);
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const setting: Setting = {
      id: this.currentId++,
      key,
      value,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.settings.set(key, setting);
    return setting;
  }

  // Marketing Campaign operations
  async getCampaigns(): Promise<MarketingCampaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<MarketingCampaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const id = this.currentId++;
    const newCampaign: MarketingCampaign = {
      ...campaign,
      id,
      status: campaign.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign> {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    const updatedCampaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    this.campaigns.delete(id);
  }

  // Promotion operations
  async getPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values());
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    return this.promotions.get(id);
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const id = this.currentId++;
    const newPromotion: Promotion = {
      ...promotion,
      id,
      status: promotion.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.promotions.set(id, newPromotion);
    return newPromotion;
  }

  async updatePromotion(id: number, updates: Partial<InsertPromotion>): Promise<Promotion> {
    const promotion = await this.getPromotion(id);
    if (!promotion) throw new Error("Promotion not found");
    const updatedPromotion = { ...promotion, ...updates, updatedAt: new Date() };
    this.promotions.set(id, updatedPromotion);
    return updatedPromotion;
  }

  async deletePromotion(id: number): Promise<void> {
    this.promotions.delete(id);
  }

  // Discount Code operations
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values());
  }

  async getDiscountCode(id: number): Promise<DiscountCode | undefined> {
    return this.discountCodes.get(id);
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    return Array.from(this.discountCodes.values()).find(
      (discountCode) => discountCode.code === code
    );
  }

  async createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode> {
    const id = this.currentId++;
    const newDiscountCode: DiscountCode = {
      ...code,
      id,
      usageCount: 0,
      createdAt: new Date()
    };
    this.discountCodes.set(id, newDiscountCode);
    return newDiscountCode;
  }

  async updateDiscountCode(id: number, updates: Partial<InsertDiscountCode>): Promise<DiscountCode> {
    const discountCode = await this.getDiscountCode(id);
    if (!discountCode) throw new Error("Discount code not found");
    const updatedDiscountCode = { ...discountCode, ...updates };
    this.discountCodes.set(id, updatedDiscountCode);
    return updatedDiscountCode;
  }

  async deleteDiscountCode(id: number): Promise<void> {
    this.discountCodes.delete(id);
  }

  // Social Media Account operations
  async getSocialMediaAccounts(): Promise<SocialMediaAccount[]> {
    return Array.from(this.socialMediaAccounts.values());
  }

  async getSocialMediaAccount(id: number): Promise<SocialMediaAccount | undefined> {
    return this.socialMediaAccounts.get(id);
  }

  async createSocialMediaAccount(account: InsertSocialMediaAccount): Promise<SocialMediaAccount> {
    const id = this.currentId++;
    const newAccount: SocialMediaAccount = {
      ...account,
      id,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.socialMediaAccounts.set(id, newAccount);
    return newAccount;
  }

  async updateSocialMediaAccount(id: number, updates: Partial<InsertSocialMediaAccount>): Promise<SocialMediaAccount> {
    const account = await this.getSocialMediaAccount(id);
    if (!account) throw new Error("Social media account not found");
    const updatedAccount = { ...account, ...updates, updatedAt: new Date() };
    this.socialMediaAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    this.socialMediaAccounts.delete(id);
  }

  // Product Group operations
  async getProductGroups(): Promise<ProductGroup[]> {
    return Array.from(this.productGroups.values());
  }

  async getProductGroup(id: number): Promise<ProductGroup | undefined> {
    return this.productGroups.get(id);
  }

  async createProductGroup(group: InsertProductGroup): Promise<ProductGroup> {
    const id = this.currentId++;
    const newGroup: ProductGroup = {
      ...group,
      id,
      createdAt: new Date(),
    };
    this.productGroups.set(id, newGroup);
    return newGroup;
  }

  async updateProductGroup(id: number, updates: Partial<InsertProductGroup>): Promise<ProductGroup> {
    const group = await this.getProductGroup(id);
    if (!group) throw new Error("Product group not found");
    const updatedGroup = { ...group, ...updates };
    this.productGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteProductGroup(id: number): Promise<void> {
    this.productGroups.delete(id);
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.barcode === barcode
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const newProduct: Product = {
      ...product,
      id,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const product = await this.getProduct(id);
    if (!product) throw new Error("Product not found");
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentId++;
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: new Date(),
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async getStoreSettings(): Promise<StoreSetting | undefined> {
    return this.storeSettings;
  }

  async updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<StoreSetting> {
    const newSettings: StoreSetting = {
      id: 1,
      storeName: settings.storeName,
      storeLogo: settings.storeLogo || null,
      createdAt: this.storeSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.storeSettings = newSettings;
    return newSettings;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentId++;
    const newSupplier: Supplier = {
      ...supplier,
      id,
      email: supplier.email || null,
      notes: supplier.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier> {
    const supplier = await this.getSupplier(id);
    if (!supplier) throw new Error("Supplier not found");
    const updatedSupplier = { ...supplier, ...updates, updatedAt: new Date() };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    this.suppliers.delete(id);
  }

  // Purchase operations
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(purchase: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.currentId++;
    const newPurchase: PurchaseOrder = {
      ...purchase,
      id,
      notes: purchase.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.purchaseOrders.set(id, newPurchase);

    // Store purchase items
    if (purchase.items) {
      const items: PurchaseItem[] = purchase.items.map((item, index) => ({
        id: this.currentId + index,
        purchaseId: id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: null,
        createdAt: new Date(),
      }));
      this.purchaseItems.set(id, items);
      this.currentId += purchase.items.length;
    }

    return newPurchase;
  }

  async updatePurchaseOrder(id: number, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder> {
    const purchase = await this.getPurchaseOrder(id);
    if (!purchase) throw new Error("Purchase order not found");
    const updatedPurchase = { ...purchase, ...updates, updatedAt: new Date() };
    this.purchaseOrders.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    this.purchaseOrders.delete(id);
    this.purchaseItems.delete(id);
  }

  async getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
    return this.purchaseItems.get(purchaseId) || [];
  }

  // Expense Category operations
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategories.values());
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return this.expenseCategories.get(id);
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.currentId++;
    const newCategory: ExpenseCategory = {
      ...category,
      id,
      description: category.description || null,
      createdAt: new Date()
    };
    this.expenseCategories.set(id, newCategory);
    return newCategory;
  }

  async updateExpenseCategory(id: number, updates: Partial<InsertExpenseCategory>): Promise<ExpenseCategory> {
    const category = await this.getExpenseCategory(id);
    if (!category) throw new Error("فئة المصروفات غير موجودة");
    const updatedCategory = { ...category, ...updates };
    this.expenseCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    this.expenseCategories.delete(id);
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentId++;
    const newExpense: Expense = {
      ...expense,
      id,
      receiptImage: expense.receiptImage || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense> {
    const expense = await this.getExpense(id);
    if (!expense) throw new Error("المصروف غير موجود");
    const updatedExpense = { ...expense, ...updates, updatedAt: new Date() };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<void> {
    this.expenses.delete(id);
  }
}

export const storage = new MemStorage();