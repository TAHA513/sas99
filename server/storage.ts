import { Pool } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import createMemoryStore from "memorystore";
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

  sessionStore: session.Store;
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
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Customer operations
  async getCustomers(): Promise<schema.Customer[]> {
    return await db.select().from(schema.customers);
  }

  async getCustomer(id: number): Promise<schema.Customer | undefined> {
    const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
    return customer;
  }

  async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
    const [newCustomer] = await db.insert(schema.customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
    const [updatedCustomer] = await db
      .update(schema.customers)
      .set(customer)
      .where(eq(schema.customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(schema.customers).where(eq(schema.customers.id, id));
  }

  // Appointment operations
  async getAppointments(): Promise<schema.Appointment[]> {
    return await db.select().from(schema.appointments);
  }

  async getAppointment(id: number): Promise<schema.Appointment | undefined> {
    const [appointment] = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id));
    return appointment;
  }

  async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
    const [newAppointment] = await db.insert(schema.appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
    const [updatedAppointment] = await db
      .update(schema.appointments)
      .set(updates)
      .where(eq(schema.appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(schema.appointments).where(eq(schema.appointments.id, id));
  }

  // Staff operations
  async getStaff(): Promise<schema.Staff[]> {
    return await db.select().from(schema.staff);
  }

  async getStaffMember(id: number): Promise<schema.Staff | undefined> {
    const [staff] = await db.select().from(schema.staff).where(eq(schema.staff.id, id));
    return staff;
  }

  async createStaff(staff: schema.InsertStaff): Promise<schema.Staff> {
    const [newStaff] = await db.insert(schema.staff).values(staff).returning();
    return newStaff;
  }

  async updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff> {
    const [updatedStaff] = await db
      .update(schema.staff)
      .set(updates)
      .where(eq(schema.staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<void> {
    await db.delete(schema.staff).where(eq(schema.staff.id, id));
  }

  // Settings operations
  async getSetting(key: string): Promise<schema.Setting | undefined> {
    const [setting] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
    return setting;
  }

  async getSettings(): Promise<schema.Setting[]> {
    return await db.select().from(schema.settings);
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
    return await db.select().from(schema.marketingCampaigns);
  }

  async getCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
    const [campaign] = await db.select().from(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    const [newCampaign] = await db.insert(schema.marketingCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    const [updatedCampaign] = await db
      .update(schema.marketingCampaigns)
      .set(updates)
      .where(eq(schema.marketingCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
  }

  // Promotion operations
  async getPromotions(): Promise<schema.Promotion[]> {
    return await db.select().from(schema.promotions);
  }

  async getPromotion(id: number): Promise<schema.Promotion | undefined> {
    const [promotion] = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id));
    return promotion;
  }

  async createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion> {
    const [newPromotion] = await db.insert(schema.promotions).values(promotion).returning();
    return newPromotion;
  }

  async updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion> {
    const [updatedPromotion] = await db
      .update(schema.promotions)
      .set(updates)
      .where(eq(schema.promotions.id, id))
      .returning();
    return updatedPromotion;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(schema.promotions).where(eq(schema.promotions.id, id));
  }

  // Discount Code operations
  async getDiscountCodes(): Promise<schema.DiscountCode[]> {
    return await db.select().from(schema.discountCodes);
  }

  async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
    const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.id, id));
    return discountCode;
  }

  async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
    const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.code, code));
    return discountCode;
  }

  async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
    const [newDiscountCode] = await db.insert(schema.discountCodes).values(code).returning();
    return newDiscountCode;
  }

  async updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode> {
    const [updatedDiscountCode] = await db
      .update(schema.discountCodes)
      .set(updates)
      .where(eq(schema.discountCodes.id, id))
      .returning();
    return updatedDiscountCode;
  }

  async deleteDiscountCode(id: number): Promise<void> {
    await db.delete(schema.discountCodes).where(eq(schema.discountCodes.id, id));
  }

  // Social Media Account operations
  async getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]> {
    return await db.select().from(schema.socialMediaAccounts);
  }

  async getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined> {
    const [account] = await db.select().from(schema.socialMediaAccounts).where(eq(schema.socialMediaAccounts.id, id));
    return account;
  }

  async createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount> {
    const [newAccount] = await db.insert(schema.socialMediaAccounts).values(account).returning();
    return newAccount;
  }

  async updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount> {
    const [updatedAccount] = await db
      .update(schema.socialMediaAccounts)
      .set(updates)
      .where(eq(schema.socialMediaAccounts.id, id))
      .returning();
    return updatedAccount;
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    await db.delete(schema.socialMediaAccounts).where(eq(schema.socialMediaAccounts.id, id));
  }

  // Product Group operations
  async getProductGroups(): Promise<schema.ProductGroup[]> {
    return await db.select().from(schema.productGroups);
  }

  async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
    const [group] = await db.select().from(schema.productGroups).where(eq(schema.productGroups.id, id));
    return group;
  }

  async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
    const [newGroup] = await db.insert(schema.productGroups).values(group).returning();
    return newGroup;
  }

  async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
    const [updatedGroup] = await db
      .update(schema.productGroups)
      .set(updates)
      .where(eq(schema.productGroups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteProductGroup(id: number): Promise<void> {
    await db.delete(schema.productGroups).where(eq(schema.productGroups.id, id));
  }

  // Product operations
  async getProducts(): Promise<schema.Product[]> {
    return await db.select().from(schema.products);
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return product;
  }

  async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.barcode, barcode));
    return product;
  }

  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    const productWithStringNumbers = {
      ...product,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
    };
    const [newProduct] = await db.insert(schema.products).values(productWithStringNumbers).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
    const updatesWithStringNumbers = {
      ...updates,
      ...(updates.costPrice && { costPrice: updates.costPrice.toString() }),
      ...(updates.sellingPrice && { sellingPrice: updates.sellingPrice.toString() }),
      ...(updates.quantity && { quantity: updates.quantity.toString() }),
    };
    const [updatedProduct] = await db
      .update(schema.products)
      .set(updatesWithStringNumbers)
      .where(eq(schema.products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  // Invoice operations
  async getInvoices(): Promise<schema.Invoice[]> {
    return await db.select().from(schema.invoices);
  }

  async getInvoice(id: number): Promise<schema.Invoice | undefined> {
    const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
    const invoiceWithStringNumbers = {
      ...invoice,
      subtotal: invoice.subtotal.toString(),
      discount: invoice.discount.toString(),
      discountAmount: invoice.discountAmount.toString(),
      finalTotal: invoice.finalTotal.toString(),
    };
    const [newInvoice] = await db.insert(schema.invoices).values([invoiceWithStringNumbers]).returning();
    return newInvoice;
  }

  // Store Settings operations
  async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
    const [settings] = await db.select().from(schema.storeSettings);
    return settings;
  }

  async updateStoreSettings(settings: {
    storeName: string;
    storeLogo?: string;
  }): Promise<schema.StoreSetting> {
    const [updatedSettings] = await db
      .insert(schema.storeSettings)
      .values({
        ...settings,
        id: 1,
      })
      .onConflictDoUpdate({
        target: schema.storeSettings.id,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return updatedSettings;
  }

  // Supplier operations
  async getSuppliers(): Promise<schema.Supplier[]> {
    return await db.select().from(schema.suppliers);
  }
  async getSupplier(id: number): Promise<schema.Supplier | undefined> {
    const [supplier] = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id));
    return supplier;
  }
  async createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier> {
    const [newSupplier] = await db.insert(schema.suppliers).values(supplier).returning();
    return newSupplier;
  }
  async updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier> {
    const [updatedSupplier] = await db
      .update(schema.suppliers)
      .set(supplier)
      .where(eq(schema.suppliers.id, id))
      .returning();
    return updatedSupplier;
  }
  async deleteSupplier(id: number): Promise<void> {
    await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id));
  }

  // Purchase operations
  async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
    return await db.select().from(schema.purchaseOrders);
  }
  async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
    const [purchaseOrder] = await db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
    return purchaseOrder;
  }
  async createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
    const purchaseWithStringNumbers = {
      ...purchase,
      totalAmount: purchase.totalAmount.toString(),
      paid: purchase.paid.toString(),
      remaining: purchase.remaining.toString(),
    };
    const [newPurchaseOrder] = await db.insert(schema.purchaseOrders).values([purchaseWithStringNumbers]).returning();
    return newPurchaseOrder;
  }
  async updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder> {
    const updatesWithStringNumbers = {
      ...updates,
      ...(updates.totalAmount && { totalAmount: updates.totalAmount.toString() }),
      ...(updates.paid && { paid: updates.paid.toString() }),
      ...(updates.remaining && { remaining: updates.remaining.toString() }),
    };
    const [updatedPurchaseOrder] = await db
      .update(schema.purchaseOrders)
      .set({ ...updatesWithStringNumbers })
      .where(eq(schema.purchaseOrders.id, id))
      .returning();
    return updatedPurchaseOrder;
  }
  async deletePurchaseOrder(id: number): Promise<void> {
    await db.delete(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
  }
  async getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]> {
    return await db.select().from(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));
  }

  // Expense Category operations
  async getExpenseCategories(): Promise<schema.ExpenseCategory[]> {
    return await db.select().from(schema.expenseCategories);
  }
  async getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined> {
    const [expenseCategory] = await db.select().from(schema.expenseCategories).where(eq(schema.expenseCategories.id, id));
    return expenseCategory;
  }
  async createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory> {
    const [newExpenseCategory] = await db.insert(schema.expenseCategories).values(category).returning();
    return newExpenseCategory;
  }
  async updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory> {
    const [updatedExpenseCategory] = await db
      .update(schema.expenseCategories)
      .set(category)
      .where(eq(schema.expenseCategories.id, id))
      .returning();
    return updatedExpenseCategory;
  }
  async deleteExpenseCategory(id: number): Promise<void> {
    await db.delete(schema.expenseCategories).where(eq(schema.expenseCategories.id, id));
  }

  // Expense operations
  async getExpenses(): Promise<schema.Expense[]> {
    return await db.select().from(schema.expenses);
  }
  async getExpense(id: number): Promise<schema.Expense | undefined> {
    const [expense] = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id));
    return expense;
  }
  async createExpense(expense: schema.InsertExpense): Promise<schema.Expense> {
    const expenseWithStringNumbers = {
      ...expense,
      amount: expense.amount.toString(),
    };
    const [newExpense] = await db.insert(schema.expenses).values([expenseWithStringNumbers]).returning();
    return newExpense;
  }
  async updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense> {
    const updatesWithStringNumbers = {
      ...updates,
      ...(updates.amount && { amount: updates.amount.toString() }),
    };
    const [updatedExpense] = await db
      .update(schema.expenses)
      .set({ ...updatesWithStringNumbers })
      .where(eq(schema.expenses.id, id))
      .returning();
    return updatedExpense;
  }
  async deleteExpense(id: number): Promise<void> {
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
  }

  // Database connection operations
  async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
    return await db.select().from(schema.databaseConnections);
  }

  async getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined> {
    const [connection] = await db.select().from(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
    return connection;
  }

  async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
    const [newConnection] = await db.insert(schema.databaseConnections).values(connection).returning();
    return newConnection;
  }

  async updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
    const [updatedConnection] = await db
      .update(schema.databaseConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(schema.databaseConnections.id, id))
      .returning();
    return updatedConnection;
  }

  async deleteDatabaseConnection(id: number): Promise<void> {
    await db.delete(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
  }

  async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
    // TODO: Implement actual connection testing logic based on the database type
    return true;
  }

  // Campaign Notification operations
  async getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]> {
    return await db
      .select()
      .from(schema.campaignNotifications)
      .where(eq(schema.campaignNotifications.campaignId, campaignId));
  }

  async createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification> {
    const [newNotification] = await db
      .insert(schema.campaignNotifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async updateCampaignNotification(
    id: number,
    notification: Partial<schema.InsertCampaignNotification>
  ): Promise<schema.CampaignNotification> {
    const [updatedNotification] = await db
      .update(schema.campaignNotifications)
      .set(notification)
      .where(eq(schema.campaignNotifications.id, id))
      .returning();
    return updatedNotification;
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
    return await db
      .select()
      .from(schema.scheduledPosts)
      .where(eq(schema.scheduledPosts.campaignId, campaignId));
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    const [newPost] = await db
      .insert(schema.scheduledPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateScheduledPost(
    id: number,
    post: Partial<schema.InsertScheduledPost>
  ): Promise<schema.ScheduledPost> {
    const [updatedPost] = await db
      .update(schema.scheduledPosts)
      .set(post)
      .where(eq(schema.scheduledPosts.id, id))
      .returning();
    return updatedPost;
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