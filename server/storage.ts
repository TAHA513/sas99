import * as schema from '@shared/schema';
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  getCustomers(): Promise<schema.Customer[]>;
  getCustomer(id: number): Promise<schema.Customer | undefined>;
  createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer>;
  updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer>;
  deleteCustomer(id: number): Promise<void>;
  getAppointments(): Promise<schema.Appointment[]>;
  getAppointment(id: number): Promise<schema.Appointment | undefined>;
  createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment>;
  updateAppointment(id: number, appointment: Partial<schema.InsertAppointment>): Promise<schema.Appointment>;
  deleteAppointment(id: number): Promise<void>;
  getStaff(): Promise<schema.Staff[]>;
  getStaffMember(id: number): Promise<schema.Staff | undefined>;
  createStaff(staff: schema.InsertStaff): Promise<schema.Staff>;
  updateStaff(id: number, staff: Partial<schema.InsertStaff>): Promise<schema.Staff>;
  deleteStaff(id: number): Promise<void>;
  getSetting(key: string): Promise<schema.Setting | undefined>;
  getSettings(): Promise<schema.Setting[]>;
  setSetting(key: string, value: string): Promise<schema.Setting>;
  getCampaigns(): Promise<schema.MarketingCampaign[]>;
  getCampaign(id: number): Promise<schema.MarketingCampaign | undefined>;
  createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign>;
  updateCampaign(id: number, campaign: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign>;
  deleteCampaign(id: number): Promise<void>;
  getPromotions(): Promise<schema.Promotion[]>;
  getPromotion(id: number): Promise<schema.Promotion | undefined>;
  createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion>;
  updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion>;
  deletePromotion(id: number): Promise<void>;
  getDiscountCodes(): Promise<schema.DiscountCode[]>;
  getDiscountCode(id: number): Promise<schema.DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined>;
  createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode>;
  updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode>;
  deleteDiscountCode(id: number): Promise<void>;
  getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]>;
  getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined>;
  createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount>;
  updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;
  getProductGroups(): Promise<schema.ProductGroup[]>;
  getProductGroup(id: number): Promise<schema.ProductGroup | undefined>;
  createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup>;
  updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup>;
  deleteProductGroup(id: number): Promise<void>;
  getProducts(): Promise<schema.Product[]>;
  getProduct(id: number): Promise<schema.Product | undefined>;
  getProductByBarcode(barcode: string): Promise<schema.Product | undefined>;
  createProduct(product: schema.InsertProduct): Promise<schema.Product>;
  updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product>;
  deleteProduct(id: number): Promise<void>;
  getInvoices(): Promise<schema.Invoice[]>;
  getInvoice(id: number): Promise<schema.Invoice | undefined>;
  createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice>;
  getStoreSettings(): Promise<schema.StoreSetting | undefined>;
  updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<schema.StoreSetting>;
  getSuppliers(): Promise<schema.Supplier[]>;
  getSupplier(id: number): Promise<schema.Supplier | undefined>;
  createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier>;
  updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier>;
  deleteSupplier(id: number): Promise<void>;
  getPurchaseOrders(): Promise<schema.PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined>;
  createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder>;
  updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder>;
  deletePurchaseOrder(id: number): Promise<void>;
  getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]>;
  getExpenseCategories(): Promise<schema.ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined>;
  createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory>;
  deleteExpenseCategory(id: number): Promise<void>;
  getExpenses(): Promise<schema.Expense[]>;
  getExpense(id: number): Promise<schema.Expense | undefined>;
  createExpense(expense: schema.InsertExpense): Promise<schema.Expense>;
  updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense>;
  deleteExpense(id: number): Promise<void>;
  getDatabaseConnections(): Promise<schema.DatabaseConnection[]>;
  getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined>;
  createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection>;
  updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection>;
  deleteDatabaseConnection(id: number): Promise<void>;
  testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean>;
  getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]>;
  createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification>;
  updateCampaignNotification(id: number, notification: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification>;
  getPendingNotifications(): Promise<schema.CampaignNotification[]>;
  getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]>;
  createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost>;
  updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost>;
  getPendingScheduledPosts(): Promise<schema.ScheduledPost[]>;
}

export class MemoryStorage implements IStorage {
  private data: Map<string, any> = new Map();
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<schema.User | undefined> {
    return this.data.get(`user-${id}`);
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    for (const [key, value] of this.data) {
        if (value.username === username && key.startsWith('user-')) {
            return value;
        }
    }
    return undefined;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const newId = this.generateId('user');
    this.data.set(`user-${newId}`, { ...user, id: newId });
    return { ...user, id: newId };
  }

  async getCustomers(): Promise<schema.Customer[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'customer');
  }

  async getCustomer(id: number): Promise<schema.Customer | undefined> {
    return this.data.get(`customer-${id}`);
  }

  async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
    const newId = this.generateId('customer');
    this.data.set(`customer-${newId}`, { ...customer, id: newId });
    return { ...customer, id: newId };
  }


  async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
    const existingCustomer = this.data.get(`customer-${id}`);
    if (existingCustomer) {
      const updatedCustomer = { ...existingCustomer, ...customer };
      this.data.set(`customer-${id}`, updatedCustomer);
      return updatedCustomer;
    }
    throw new Error("Customer not found");
  }

  async deleteCustomer(id: number): Promise<void> {
    this.data.delete(`customer-${id}`);
  }

  async getAppointments(): Promise<schema.Appointment[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'appointment');
  }

  async getAppointment(id: number): Promise<schema.Appointment | undefined> {
      return this.data.get(`appointment-${id}`);
  }

  async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
    const newId = this.generateId('appointment');
    this.data.set(`appointment-${newId}`, { ...appointment, id: newId });
    return { ...appointment, id: newId };
  }

  async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
    const existingAppointment = this.data.get(`appointment-${id}`);
    if (existingAppointment) {
      const updatedAppointment = { ...existingAppointment, ...updates };
      this.data.set(`appointment-${id}`, updatedAppointment);
      return updatedAppointment;
    }
    throw new Error("Appointment not found");
  }

  async deleteAppointment(id: number): Promise<void> {
    this.data.delete(`appointment-${id}`);
  }

  async getStaff(): Promise<schema.Staff[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'staff');
  }

  async getStaffMember(id: number): Promise<schema.Staff | undefined> {
    return this.data.get(`staff-${id}`);
  }

  async createStaff(staff: schema.InsertStaff): Promise<schema.Staff> {
    const newId = this.generateId('staff');
    this.data.set(`staff-${newId}`, { ...staff, id: newId });
    return { ...staff, id: newId };
  }

  async updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff> {
    const existingStaff = this.data.get(`staff-${id}`);
    if (existingStaff) {
      const updatedStaff = { ...existingStaff, ...updates };
      this.data.set(`staff-${id}`, updatedStaff);
      return updatedStaff;
    }
    throw new Error("Staff member not found");
  }

  async deleteStaff(id: number): Promise<void> {
    this.data.delete(`staff-${id}`);
  }

  async getSetting(key: string): Promise<schema.Setting | undefined> {
    return this.data.get(`setting-${key}`);
  }

  async getSettings(): Promise<schema.Setting[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'setting');
  }

  async setSetting(key: string, value: string): Promise<schema.Setting> {
    this.data.set(`setting-${key}`, { key, value, type: 'setting' });
    return { key, value, type: 'setting' };
  }

  async getCampaigns(): Promise<schema.MarketingCampaign[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'campaign');
  }

  async getCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
    return this.data.get(`campaign-${id}`);
  }

  async createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    const newId = this.generateId('campaign');
    this.data.set(`campaign-${newId}`, { ...campaign, id: newId, type: 'campaign' });
    return { ...campaign, id: newId, type: 'campaign' };
  }

  async updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    const existingCampaign = this.data.get(`campaign-${id}`);
    if (existingCampaign) {
      const updatedCampaign = { ...existingCampaign, ...updates };
      this.data.set(`campaign-${id}`, updatedCampaign);
      return updatedCampaign;
    }
    throw new Error("Campaign not found");
  }

  async deleteCampaign(id: number): Promise<void> {
    this.data.delete(`campaign-${id}`);
  }

  async getPromotions(): Promise<schema.Promotion[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'promotion');
  }

  async getPromotion(id: number): Promise<schema.Promotion | undefined> {
    return this.data.get(`promotion-${id}`);
  }

  async createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion> {
    const newId = this.generateId('promotion');
    this.data.set(`promotion-${newId}`, { ...promotion, id: newId, type: 'promotion' });
    return { ...promotion, id: newId, type: 'promotion' };
  }

  async updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion> {
    const existingPromotion = this.data.get(`promotion-${id}`);
    if (existingPromotion) {
      const updatedPromotion = { ...existingPromotion, ...updates };
      this.data.set(`promotion-${id}`, updatedPromotion);
      return updatedPromotion;
    }
    throw new Error("Promotion not found");
  }

  async deletePromotion(id: number): Promise<void> {
    this.data.delete(`promotion-${id}`);
  }

  async getDiscountCodes(): Promise<schema.DiscountCode[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'discountCode');
  }

  async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
    return this.data.get(`discountCode-${id}`);
  }

  async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
    for (const [key, value] of this.data) {
      if (value.code === code && key.startsWith('discountCode-')) {
        return value;
      }
    }
    return undefined;
  }

  async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
    const newId = this.generateId('discountCode');
    this.data.set(`discountCode-${newId}`, { ...code, id: newId, type: 'discountCode' });
    return { ...code, id: newId, type: 'discountCode' };
  }

  async updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode> {
    const existingDiscountCode = this.data.get(`discountCode-${id}`);
    if (existingDiscountCode) {
      const updatedDiscountCode = { ...existingDiscountCode, ...updates };
      this.data.set(`discountCode-${id}`, updatedDiscountCode);
      return updatedDiscountCode;
    }
    throw new Error("Discount code not found");
  }

  async deleteDiscountCode(id: number): Promise<void> {
    this.data.delete(`discountCode-${id}`);
  }

  async getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'socialMediaAccount');
  }

  async getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined> {
    return this.data.get(`socialMediaAccount-${id}`);
  }

  async createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount> {
    const newId = this.generateId('socialMediaAccount');
    this.data.set(`socialMediaAccount-${newId}`, { ...account, id: newId, type: 'socialMediaAccount' });
    return { ...account, id: newId, type: 'socialMediaAccount' };
  }

  async updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount> {
    const existingSocialMediaAccount = this.data.get(`socialMediaAccount-${id}`);
    if (existingSocialMediaAccount) {
      const updatedSocialMediaAccount = { ...existingSocialMediaAccount, ...updates };
      this.data.set(`socialMediaAccount-${id}`, updatedSocialMediaAccount);
      return updatedSocialMediaAccount;
    }
    throw new Error("Social media account not found");
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    this.data.delete(`socialMediaAccount-${id}`);
  }

  async getProductGroups(): Promise<schema.ProductGroup[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'productGroup');
  }

  async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
    return this.data.get(`productGroup-${id}`);
  }

  async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
    const newId = this.generateId('productGroup');
    this.data.set(`productGroup-${newId}`, { ...group, id: newId, type: 'productGroup' });
    return { ...group, id: newId, type: 'productGroup' };
  }

  async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
    const existingProductGroup = this.data.get(`productGroup-${id}`);
    if (existingProductGroup) {
      const updatedProductGroup = { ...existingProductGroup, ...updates };
      this.data.set(`productGroup-${id}`, updatedProductGroup);
      return updatedProductGroup;
    }
    throw new Error("Product group not found");
  }

  async deleteProductGroup(id: number): Promise<void> {
    this.data.delete(`productGroup-${id}`);
  }

  async getProducts(): Promise<schema.Product[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'product');
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    return this.data.get(`product-${id}`);
  }

  async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
    for (const [key, value] of this.data) {
      if (value.barcode === barcode && key.startsWith('product-')) {
        return value;
      }
    }
    return undefined;
  }

  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    const newId = this.generateId('product');
    this.data.set(`product-${newId}`, { ...product, id: newId, type: 'product' });
    return { ...product, id: newId, type: 'product' };
  }

  async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
    const existingProduct = this.data.get(`product-${id}`);
    if (existingProduct) {
      const updatedProduct = { ...existingProduct, ...updates };
      this.data.set(`product-${id}`, updatedProduct);
      return updatedProduct;
    }
    throw new Error("Product not found");
  }

  async deleteProduct(id: number): Promise<void> {
    this.data.delete(`product-${id}`);
  }

  async getInvoices(): Promise<schema.Invoice[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'invoice');
  }

  async getInvoice(id: number): Promise<schema.Invoice | undefined> {
    return this.data.get(`invoice-${id}`);
  }

  async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
    const newId = this.generateId('invoice');
    this.data.set(`invoice-${newId}`, { ...invoice, id: newId, type: 'invoice' });
    return { ...invoice, id: newId, type: 'invoice' };
  }

  async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
    return this.data.get('storeSettings');
  }

  async updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<schema.StoreSetting> {
    this.data.set('storeSettings', { ...settings, id: 1, type: 'storeSettings' });
    return { ...settings, id: 1, type: 'storeSettings' };
  }

  async getSuppliers(): Promise<schema.Supplier[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'supplier');
  }
  async getSupplier(id: number): Promise<schema.Supplier | undefined> {
    return this.data.get(`supplier-${id}`);
  }

  async createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier> {
    const newId = this.generateId('supplier');
    this.data.set(`supplier-${newId}`, { ...supplier, id: newId, type: 'supplier' });
    return { ...supplier, id: newId, type: 'supplier' };
  }

  async updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier> {
    const existingSupplier = this.data.get(`supplier-${id}`);
    if (existingSupplier) {
      const updatedSupplier = { ...existingSupplier, ...supplier };
      this.data.set(`supplier-${id}`, updatedSupplier);
      return updatedSupplier;
    }
    throw new Error("Supplier not found");
  }

  async deleteSupplier(id: number): Promise<void> {
    this.data.delete(`supplier-${id}`);
  }

  async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'purchaseOrder');
  }
  async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
    return this.data.get(`purchaseOrder-${id}`);
  }

  async createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
    const newId = this.generateId('purchaseOrder');
    this.data.set(`purchaseOrder-${newId}`, { ...purchase, id: newId, type: 'purchaseOrder' });
    return { ...purchase, id: newId, type: 'purchaseOrder' };
  }

  async updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder> {
    const existingPurchaseOrder = this.data.get(`purchaseOrder-${id}`);
    if (existingPurchaseOrder) {
      const updatedPurchaseOrder = { ...existingPurchaseOrder, ...updates };
      this.data.set(`purchaseOrder-${id}`, updatedPurchaseOrder);
      return updatedPurchaseOrder;
    }
    throw new Error("Purchase order not found");
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    this.data.delete(`purchaseOrder-${id}`);
  }

  async getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]> {
    return Array.from(this.data.values()).filter(item => item.purchaseId === purchaseId && item.type === 'purchaseItem');
  }


  async getExpenseCategories(): Promise<schema.ExpenseCategory[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'expenseCategory');
  }
  async getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined> {
    return this.data.get(`expenseCategory-${id}`);
  }

  async createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory> {
    const newId = this.generateId('expenseCategory');
    this.data.set(`expenseCategory-${newId}`, { ...category, id: newId, type: 'expenseCategory' });
    return { ...category, id: newId, type: 'expenseCategory' };
  }

  async updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory> {
    const existingExpenseCategory = this.data.get(`expenseCategory-${id}`);
    if (existingExpenseCategory) {
      const updatedExpenseCategory = { ...existingExpenseCategory, ...category };
      this.data.set(`expenseCategory-${id}`, updatedExpenseCategory);
      return updatedExpenseCategory;
    }
    throw new Error("Expense category not found");
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    this.data.delete(`expenseCategory-${id}`);
  }

  async getExpenses(): Promise<schema.Expense[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'expense');
  }
  async getExpense(id: number): Promise<schema.Expense | undefined> {
    return this.data.get(`expense-${id}`);
  }

  async createExpense(expense: schema.InsertExpense): Promise<schema.Expense> {
    const newId = this.generateId('expense');
    this.data.set(`expense-${newId}`, { ...expense, id: newId, type: 'expense' });
    return { ...expense, id: newId, type: 'expense' };
  }

  async updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense> {
    const existingExpense = this.data.get(`expense-${id}`);
    if (existingExpense) {
      const updatedExpense = { ...existingExpense, ...updates };
      this.data.set(`expense-${id}`, updatedExpense);
      return updatedExpense;
    }
    throw new Error("Expense not found");
  }

  async deleteExpense(id: number): Promise<void> {
    this.data.delete(`expense-${id}`);
  }

  async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
    return Array.from(this.data.values()).filter(item => item.type === 'databaseConnection');
  }

  async getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined> {
    return this.data.get(`databaseConnection-${id}`);
  }

  async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
    const newId = this.generateId('databaseConnection');
    this.data.set(`databaseConnection-${newId}`, { ...connection, id: newId, type: 'databaseConnection' });
    return { ...connection, id: newId, type: 'databaseConnection' };
  }

  async updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
    const existingDatabaseConnection = this.data.get(`databaseConnection-${id}`);
    if (existingDatabaseConnection) {
      const updatedDatabaseConnection = { ...existingDatabaseConnection, ...connection };
      this.data.set(`databaseConnection-${id}`, updatedDatabaseConnection);
      return updatedDatabaseConnection;
    }
    throw new Error("Database connection not found");
  }

  async deleteDatabaseConnection(id: number): Promise<void> {
    this.data.delete(`databaseConnection-${id}`);
  }

  async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
    return true; // Placeholder - No actual connection testing needed
  }

  async getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]> {
    return Array.from(this.data.values()).filter(item => item.campaignId === campaignId && item.type === 'campaignNotification');
  }

  async createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification> {
    const newId = this.generateId('campaignNotification');
    this.data.set(`campaignNotification-${newId}`, { ...notification, id: newId, type: 'campaignNotification' });
    return { ...notification, id: newId, type: 'campaignNotification' };
  }

  async updateCampaignNotification(id: number, notification: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification> {
    const existingCampaignNotification = this.data.get(`campaignNotification-${id}`);
    if (existingCampaignNotification) {
      const updatedCampaignNotification = { ...existingCampaignNotification, ...notification };
      this.data.set(`campaignNotification-${id}`, updatedCampaignNotification);
      return updatedCampaignNotification;
    }
    throw new Error("Campaign notification not found");
  }

  async getPendingNotifications(): Promise<schema.CampaignNotification[]> {
    return Array.from(this.data.values()).filter(item => item.status === 'pending' && item.type === 'campaignNotification');
  }

  async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
    return Array.from(this.data.values()).filter(item => item.campaignId === campaignId && item.type === 'scheduledPost');
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    const newId = this.generateId('scheduledPost');
    this.data.set(`scheduledPost-${newId}`, { ...post, id: newId, type: 'scheduledPost' });
    return { ...post, id: newId, type: 'scheduledPost' };
  }

  async updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost> {
    const existingScheduledPost = this.data.get(`scheduledPost-${id}`);
    if (existingScheduledPost) {
      const updatedScheduledPost = { ...existingScheduledPost, ...post };
      this.data.set(`scheduledPost-${id}`, updatedScheduledPost);
      return updatedScheduledPost;
    }
    throw new Error("Scheduled post not found");
  }

  async getPendingScheduledPosts(): Promise<schema.ScheduledPost[]> {
    return Array.from(this.data.values()).filter(item => item.status === 'pending' && item.type === 'scheduledPost');
  }

  private generateId(type: string): number {
    let id = 1;
    while (this.data.has(`${type}-${id}`)) {
      id++;
    }
    return id;
  }
}

export const storage = new MemoryStorage();