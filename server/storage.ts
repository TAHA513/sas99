import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;

  // Customer operations
  getCustomers(): Promise<schema.Customer[]>;
  getCustomer(id: number): Promise<schema.Customer | undefined>;
  createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer>;
  updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Appointment operations
  getAppointments(): Promise<schema.Appointment[]>;
  getAppointment(id: number): Promise<schema.Appointment | undefined>;
  createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment>;
  updateAppointment(id: number, appointment: Partial<schema.InsertAppointment>): Promise<schema.Appointment>;
  deleteAppointment(id: number): Promise<void>;

  // Staff operations
  getStaff(): Promise<schema.Staff[]>;
  getStaffMember(id: number): Promise<schema.Staff | undefined>;
  createStaff(staff: schema.InsertStaff): Promise<schema.Staff>;
  updateStaff(id: number, staff: Partial<schema.InsertStaff>): Promise<schema.Staff>;
  deleteStaff(id: number): Promise<void>;

  // Settings operations
  getSetting(key: string): Promise<schema.Setting | undefined>;
  getSettings(): Promise<schema.Setting[]>;
  setSetting(key: string, value: string): Promise<schema.Setting>;

  // Marketing Campaign operations
  getCampaigns(): Promise<schema.MarketingCampaign[]>;
  getCampaign(id: number): Promise<schema.MarketingCampaign | undefined>;
  createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign>;
  updateCampaign(id: number, campaign: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign>;
  deleteCampaign(id: number): Promise<void>;

  // Promotion operations
  getPromotions(): Promise<schema.Promotion[]>;
  getPromotion(id: number): Promise<schema.Promotion | undefined>;
  createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion>;
  updatePromotion(id: number, promotion: Partial<schema.InsertPromotion>): Promise<schema.Promotion>;
  deletePromotion(id: number): Promise<void>;

  // Discount Code operations
  getDiscountCodes(): Promise<schema.DiscountCode[]>;
  getDiscountCode(id: number): Promise<schema.DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined>;
  createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode>;
  updateDiscountCode(id: number, code: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode>;
  deleteDiscountCode(id: number): Promise<void>;

  // Social Media Account operations
  getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]>;
  getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined>;
  createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount>;
  updateSocialMediaAccount(id: number, account: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;

  // Product Group operations
  getProductGroups(): Promise<schema.ProductGroup[]>;
  getProductGroup(id: number): Promise<schema.ProductGroup | undefined>;
  createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup>;
  updateProductGroup(id: number, group: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup>;
  deleteProductGroup(id: number): Promise<void>;

  // Product operations
  getProducts(): Promise<schema.Product[]>;
  getProduct(id: number): Promise<schema.Product | undefined>;
  getProductByBarcode(barcode: string): Promise<schema.Product | undefined>;
  createProduct(product: schema.InsertProduct): Promise<schema.Product>;
  updateProduct(id: number, product: Partial<schema.InsertProduct>): Promise<schema.Product>;
  deleteProduct(id: number): Promise<void>;

  // Invoice operations
  getInvoices(): Promise<schema.Invoice[]>;
  getInvoice(id: number): Promise<schema.Invoice | undefined>;
  createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice>;

  // Store Settings operations
  getStoreSettings(): Promise<schema.StoreSetting | undefined>;
  updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<schema.StoreSetting>;

  // Supplier operations
  getSuppliers(): Promise<schema.Supplier[]>;
  getSupplier(id: number): Promise<schema.Supplier | undefined>;
  createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier>;
  updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier>;
  deleteSupplier(id: number): Promise<void>;

  // Purchase operations
  getPurchaseOrders(): Promise<schema.PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined>;
  createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder>;
  updatePurchaseOrder(id: number, purchase: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder>;
  deletePurchaseOrder(id: number): Promise<void>;
  getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]>;

  // Expense Category operations
  getExpenseCategories(): Promise<schema.ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined>;
  createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory>;
  deleteExpenseCategory(id: number): Promise<void>;

  // Expense operations
  getExpenses(): Promise<schema.Expense[]>;
  getExpense(id: number): Promise<schema.Expense | undefined>;
  createExpense(expense: schema.InsertExpense): Promise<schema.Expense>;
  updateExpense(id: number, expense: Partial<schema.InsertExpense>): Promise<schema.Expense>;
  deleteExpense(id: number): Promise<void>;

  // Database connection operations
  getDatabaseConnections(): Promise<schema.DatabaseConnection[]>;
  getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined>;
  createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection>;
  updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection>;
  deleteDatabaseConnection(id: number): Promise<void>;
  testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean>;

  // Campaign Notification operations
  getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]>;
  createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification>;
  updateCampaignNotification(id: number, notification: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification>;
  getPendingNotifications(): Promise<schema.CampaignNotification[]>;

  // Scheduled Post operations
  getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]>;
  createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost>;
  updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost>;
  getPendingScheduledPosts(): Promise<schema.ScheduledPost[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // دوال مساعدة عامة لتقليل التكرار
  private async selectOne<T>(table: any, condition: any): Promise<T | undefined> {
    const [result] = await db.select().from(table).where(condition);
    return result;
  }

  private async selectAll<T>(table: any): Promise<T[]> {
    return await db.select().from(table);
  }

  private async insertAndReturn<T>(table: any, values: T): Promise<T> {
    const [result] = await db.insert(table).values(values).returning();
    return result;
  }

  private async updateAndReturn<T>(
    table: any,
    id: number,
    values: Partial<T>,
    idField: any
  ): Promise<T> {
    const [result] = await db.update(table).set(values).where(eq(idField, id)).returning();
    return result;
  }

  private async deleteRow(table: any, id: number, idField: any): Promise<void> {
    await db.delete(table).where(eq(idField, id));
  }

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    return this.selectOne(schema.users, eq(schema.users.id, id));
  }
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return this.selectOne(schema.users, eq(schema.users.username, username));
  }
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    return this.insertAndReturn(schema.users, user);
  }

  // Customer operations
  async getCustomers(): Promise<schema.Customer[]> {
    return this.selectAll(schema.customers);
  }
  async getCustomer(id: number): Promise<schema.Customer | undefined> {
    return this.selectOne(schema.customers, eq(schema.customers.id, id));
  }
  async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
    return this.insertAndReturn(schema.customers, customer);
  }
  async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
    return this.updateAndReturn(schema.customers, id, customer, schema.customers.id);
  }
  async deleteCustomer(id: number): Promise<void> {
    await this.deleteRow(schema.customers, id, schema.customers.id);
  }

  // Appointment operations
  async getAppointments(): Promise<schema.Appointment[]> {
    return this.selectAll(schema.appointments);
  }
  async getAppointment(id: number): Promise<schema.Appointment | undefined> {
    return this.selectOne(schema.appointments, eq(schema.appointments.id, id));
  }
  async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
    return this.insertAndReturn(schema.appointments, appointment);
  }
  async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
    return this.updateAndReturn(schema.appointments, id, updates, schema.appointments.id);
  }
  async deleteAppointment(id: number): Promise<void> {
    await this.deleteRow(schema.appointments, id, schema.appointments.id);
  }

  // Staff operations
  async getStaff(): Promise<schema.Staff[]> {
    return this.selectAll(schema.staff);
  }
  async getStaffMember(id: number): Promise<schema.Staff | undefined> {
    return this.selectOne(schema.staff, eq(schema.staff.id, id));
  }
  async createStaff(staff: schema.InsertStaff): Promise<schema.Staff> {
    return this.insertAndReturn(schema.staff, staff);
  }
  async updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff> {
    return this.updateAndReturn(schema.staff, id, updates, schema.staff.id);
  }
  async deleteStaff(id: number): Promise<void> {
    await this.deleteRow(schema.staff, id, schema.staff.id);
  }

  // Settings operations
  async getSetting(key: string): Promise<schema.Setting | undefined> {
    return this.selectOne(schema.settings, eq(schema.settings.key, key));
  }
  async getSettings(): Promise<schema.Setting[]> {
    return this.selectAll(schema.settings);
  }
  async setSetting(key: string, value: string): Promise<schema.Setting> {
    const [setting] = await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  // Marketing Campaign operations
  async getCampaigns(): Promise<schema.MarketingCampaign[]> {
    return this.selectAll(schema.marketingCampaigns);
  }
  async getCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
    return this.selectOne(schema.marketingCampaigns, eq(schema.marketingCampaigns.id, id));
  }
  async createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    return this.insertAndReturn(schema.marketingCampaigns, campaign);
  }
  async updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    return this.updateAndReturn(schema.marketingCampaigns, id, updates, schema.marketingCampaigns.id);
  }
  async deleteCampaign(id: number): Promise<void> {
    await this.deleteRow(schema.marketingCampaigns, id, schema.marketingCampaigns.id);
  }

  // Promotion operations
  async getPromotions(): Promise<schema.Promotion[]> {
    return this.selectAll(schema.promotions);
  }
  async getPromotion(id: number): Promise<schema.Promotion | undefined> {
    return this.selectOne(schema.promotions, eq(schema.promotions.id, id));
  }
  async createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion> {
    return this.insertAndReturn(schema.promotions, promotion);
  }
  async updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion> {
    return this.updateAndReturn(schema.promotions, id, updates, schema.promotions.id);
  }
  async deletePromotion(id: number): Promise<void> {
    await this.deleteRow(schema.promotions, id, schema.promotions.id);
  }

  // Discount Code operations
  async getDiscountCodes(): Promise<schema.DiscountCode[]> {
    return this.selectAll(schema.discountCodes);
  }
  async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
    return this.selectOne(schema.discountCodes, eq(schema.discountCodes.id, id));
  }
  async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
    return this.selectOne(schema.discountCodes, eq(schema.discountCodes.code, code));
  }
  async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
    return this.insertAndReturn(schema.discountCodes, code);
  }
  async updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode> {
    return this.updateAndReturn(schema.discountCodes, id, updates, schema.discountCodes.id);
  }
  async deleteDiscountCode(id: number): Promise<void> {
    await this.deleteRow(schema.discountCodes, id, schema.discountCodes.id);
  }

  // Social Media Account operations
  async getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]> {
    return this.selectAll(schema.socialMediaAccounts);
  }
  async getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined> {
    return this.selectOne(schema.socialMediaAccounts, eq(schema.socialMediaAccounts.id, id));
  }
  async createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount> {
    return this.insertAndReturn(schema.socialMediaAccounts, account);
  }
  async updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount> {
    return this.updateAndReturn(schema.socialMediaAccounts, id, updates, schema.socialMediaAccounts.id);
  }
  async deleteSocialMediaAccount(id: number): Promise<void> {
    await this.deleteRow(schema.socialMediaAccounts, id, schema.socialMediaAccounts.id);
  }

  // Product Group operations
  async getProductGroups(): Promise<schema.ProductGroup[]> {
    return this.selectAll(schema.productGroups);
  }
  async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
    return this.selectOne(schema.productGroups, eq(schema.productGroups.id, id));
  }
  async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
    return this.insertAndReturn(schema.productGroups, group);
  }
  async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
    return this.updateAndReturn(schema.productGroups, id, updates, schema.productGroups.id);
  }
  async deleteProductGroup(id: number): Promise<void> {
    await this.deleteRow(schema.productGroups, id, schema.productGroups.id);
  }

  // Product operations
  async getProducts(): Promise<schema.Product[]> {
    return this.selectAll(schema.products);
  }
  async getProduct(id: number): Promise<schema.Product | undefined> {
    return this.selectOne(schema.products, eq(schema.products.id, id));
  }
  async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
    return this.selectOne(schema.products, eq(schema.products.barcode, barcode));
  }
  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    const formatted = {
      ...product,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
    };
    return this.insertAndReturn(schema.products, formatted);
  }
  async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
    const formatted = {
      ...updates,
      ...(updates.costPrice && { costPrice: updates.costPrice.toString() }),
      ...(updates.sellingPrice && { sellingPrice: updates.sellingPrice.toString() }),
      ...(updates.quantity && { quantity: updates.quantity.toString() }),
    };
    return this.updateAndReturn(schema.products, id, formatted, schema.products.id);
  }
  async deleteProduct(id: number): Promise<void> {
    await this.deleteRow(schema.products, id, schema.products.id);
  }

  // Invoice operations
  async getInvoices(): Promise<schema.Invoice[]> {
    return this.selectAll(schema.invoices);
  }
  async getInvoice(id: number): Promise<schema.Invoice | undefined> {
    return this.selectOne(schema.invoices, eq(schema.invoices.id, id));
  }
  async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
    const formatted = {
      ...invoice,
      subtotal: invoice.subtotal.toString(),
      discount: invoice.discount.toString(),
      discountAmount: invoice.discountAmount.toString(),
      finalTotal: invoice.finalTotal.toString(),
    };
    return this.insertAndReturn(schema.invoices, formatted);
  }

  // Store Settings operations
  async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
    const [settings] = await db.select().from(schema.storeSettings);
    return settings;
  }
  async updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<schema.StoreSetting> {
    const [updatedSettings] = await db
      .insert(schema.storeSettings)
      .values({ ...settings, id: 1 })
      .onConflictDoUpdate({
        target: schema.storeSettings.id,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return updatedSettings;
  }

  // Supplier operations
  async getSuppliers(): Promise<schema.Supplier[]> {
    return this.selectAll(schema.suppliers);
  }
  async getSupplier(id: number): Promise<schema.Supplier | undefined> {
    return this.selectOne(schema.suppliers, eq(schema.suppliers.id, id));
  }
  async createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier> {
    return this.insertAndReturn(schema.suppliers, supplier);
  }
  async updateSupplier(id: number, updates: Partial<schema.InsertSupplier>): Promise<schema.Supplier> {
    return this.updateAndReturn(schema.suppliers, id, updates, schema.suppliers.id);
  }
  async deleteSupplier(id: number): Promise<void> {
    await this.deleteRow(schema.suppliers, id, schema.suppliers.id);
  }

  // Purchase operations
  async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
    return this.selectAll(schema.purchaseOrders);
  }
  async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
    return this.selectOne(schema.purchaseOrders, eq(schema.purchaseOrders.id, id));
  }
  async createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
    const formatted = {
      ...purchase,
      totalAmount: purchase.totalAmount.toString(),
      paid: purchase.paid.toString(),
      remaining: purchase.remaining.toString(),
    };
    return this.insertAndReturn(schema.purchaseOrders, formatted);
  }
  async updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder> {
    const formatted = {
      ...updates,
      ...(updates.totalAmount && { totalAmount: updates.totalAmount.toString() }),
      ...(updates.paid && { paid: updates.paid.toString() }),
      ...(updates.remaining && { remaining: updates.remaining.toString() }),
    };
    return this.updateAndReturn(schema.purchaseOrders, id, formatted, schema.purchaseOrders.id);
  }
  async deletePurchaseOrder(id: number): Promise<void> {
    await this.deleteRow(schema.purchaseOrders, id, schema.purchaseOrders.id);
  }
  async getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]> {
    return await db.select().from(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));
  }

  // Expense Category operations
  async getExpenseCategories(): Promise<schema.ExpenseCategory[]> {
    return this.selectAll(schema.expenseCategories);
  }
  async getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined> {
    return this.selectOne(schema.expenseCategories, eq(schema.expenseCategories.id, id));
  }
  async createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory> {
    return this.insertAndReturn(schema.expenseCategories, category);
  }
  async updateExpenseCategory(id: number, updates: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory> {
    return this.updateAndReturn(schema.expenseCategories, id, updates, schema.expenseCategories.id);
  }
  async deleteExpenseCategory(id: number): Promise<void> {
    await this.deleteRow(schema.expenseCategories, id, schema.expenseCategories.id);
  }

  // Expense operations
  async getExpenses(): Promise<schema.Expense[]> {
    return this.selectAll(schema.expenses);
  }
  async getExpense(id: number): Promise<schema.Expense | undefined> {
    return this.selectOne(schema.expenses, eq(schema.expenses.id, id));
  }
  async createExpense(expense: schema.InsertExpense): Promise<schema.Expense> {
    const formatted = {
      ...expense,
      amount: expense.amount.toString(),
    };
    return this.insertAndReturn(schema.expenses, formatted);
  }
  async updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense> {
    const formatted = {
      ...updates,
      ...(updates.amount && { amount: updates.amount.toString() }),
    };
    return this.updateAndReturn(schema.expenses, id, formatted, schema.expenses.id);
  }
  async deleteExpense(id: number): Promise<void> {
    await this.deleteRow(schema.expenses, id, schema.expenses.id);
  }

  // Database connection operations
  async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
    return this.selectAll(schema.databaseConnections);
  }
  async getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined> {
    return this.selectOne(schema.databaseConnections, eq(schema.databaseConnections.id, id));
  }
  async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
    return this.insertAndReturn(schema.databaseConnections, connection);
  }
  async updateDatabaseConnection(id: number, updates: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
    return this.updateAndReturn(schema.databaseConnections, id, { ...updates, updatedAt: new Date() }, schema.databaseConnections.id);
  }
  async deleteDatabaseConnection(id: number): Promise<void> {
    await this.deleteRow(schema.databaseConnections, id, schema.databaseConnections.id);
  }
  async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
    // تنفيذ منطق اختبار الاتصال بناءً على نوع قاعدة البيانات
    return true;
  }

  // Campaign Notification operations
  async getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]> {
    return await db.select().from(schema.campaignNotifications).where(eq(schema.campaignNotifications.campaignId, campaignId));
  }
  async createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification> {
    return this.insertAndReturn(schema.campaignNotifications, notification);
  }
  async updateCampaignNotification(id: number, updates: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification> {
    return this.updateAndReturn(schema.campaignNotifications, id, updates, schema.campaignNotifications.id);
  }
  async getPendingNotifications(): Promise<schema.CampaignNotification[]> {
    return await db
      .select()
      .from(schema.campaignNotifications)
      .where(eq(schema.campaignNotifications.status, 'pending'))
      .orderBy(schema.campaignNotifications.scheduledFor);
  }

  // Scheduled Post operations
  async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
    return await db.select().from(schema.scheduledPosts).where(eq(schema.scheduledPosts.campaignId, campaignId));
  }
  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    return this.insertAndReturn(schema.scheduledPosts, post);
  }
  async updateScheduledPost(id: number, updates: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost> {
    return this.updateAndReturn(schema.scheduledPosts, id, updates, schema.scheduledPosts.id);
  }
  async getPendingScheduledPosts(): Promise<schema.ScheduledPost[]> {
    return await db
      .select()
      .from(schema.scheduledPosts)
      .where(eq(schema.scheduledPosts.status, 'pending'))
      .orderBy(schema.scheduledPosts.scheduledTime);
  }
}

export const storage = new DatabaseStorage();
