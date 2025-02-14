import { User, Customer, Appointment, Staff, InsertUser, InsertCustomer, InsertAppointment, InsertStaff, MarketingCampaign, InsertMarketingCampaign, Promotion, InsertPromotion, DiscountCode, InsertDiscountCode, SocialMediaAccount, InsertSocialMediaAccount } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

interface Setting {
    id: number;
    key: string;
    value: string;
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

  sessionStore: session.Store;
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
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
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
}

export const storage = new MemStorage();