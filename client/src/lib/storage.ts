// Local storage keys
const STORAGE_KEYS = {
  STORE_SETTINGS: 'store-settings',
  SOCIAL_ACCOUNTS: 'social-accounts',
  WHATSAPP_SETTINGS: 'whatsapp-settings',
  GOOGLE_CALENDAR_SETTINGS: 'google-calendar-settings',
  SOCIAL_MEDIA_SETTINGS: 'social-media-settings',
  PRODUCTS: 'products',
  PRODUCT_GROUPS: 'product-groups',
  CUSTOMERS: 'customers',
  INVOICES: 'invoices',
  EXPENSES: 'expenses',
  EXPENSE_CATEGORIES: 'expense-categories',
  SUPPLIERS: 'suppliers',
  PURCHASE_ORDERS: 'purchase-orders',
  USERS: 'users',
  STAFF: 'staff',
  APPOINTMENTS: 'appointments',
} as const;

// Import types from schema
import type {
  Product, InsertProduct,
  ProductGroup, InsertProductGroup,
  Customer, InsertCustomer,
  Invoice, InsertInvoice,
  Expense, InsertExpense,
  ExpenseCategory, InsertExpenseCategory,
  Supplier, InsertSupplier,
  PurchaseOrder, InsertPurchaseOrder,
  User, InsertUser,
  Staff, InsertStaff,
  Appointment, InsertAppointment
} from '@shared/schema';

// Store Settings
export interface StoreSettings {
  storeName: string;
  storeLogo: string;
  currencySettings?: {
    defaultCurrency: 'USD' | 'IQD';
    usdToIqdRate: number;
  };
}

// Social Media Account
export interface SocialMediaAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'snapchat';
  username: string;
  password: string;
  status: 'active' | 'inactive';
}

// WhatsApp Settings
export interface WhatsAppSettings {
  WHATSAPP_API_TOKEN: string;
  WHATSAPP_BUSINESS_PHONE_NUMBER: string;
}

// Google Calendar Settings
export interface GoogleCalendarSettings {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

// Social Media Settings
export interface SocialMediaSettings {
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  INSTAGRAM_ACCESS_TOKEN: string;
}

// Generic get and set functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Store Settings
export const getStoreSettings = (): StoreSettings =>
  getItem<StoreSettings>(STORAGE_KEYS.STORE_SETTINGS, {
    storeName: '',
    storeLogo: '',
    currencySettings: {
      defaultCurrency: 'USD',
      usdToIqdRate: 1460
    }
  });

export const setStoreSettings = (settings: Partial<StoreSettings>) => {
  const current = getStoreSettings();
  setItem(STORAGE_KEYS.STORE_SETTINGS, { ...current, ...settings });
};

// Social Media Accounts
export const getSocialAccounts = (): SocialMediaAccount[] =>
  getItem<SocialMediaAccount[]>(STORAGE_KEYS.SOCIAL_ACCOUNTS, []);

export const addSocialAccount = (account: Omit<SocialMediaAccount, 'id'>) => {
  const accounts = getSocialAccounts();
  const newAccount = {
    ...account,
    id: accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1,
    status: 'active' as const
  };
  setItem(STORAGE_KEYS.SOCIAL_ACCOUNTS, [...accounts, newAccount]);
  return newAccount;
};

// WhatsApp Settings
export const getWhatsAppSettings = (): WhatsAppSettings =>
  getItem<WhatsAppSettings>(STORAGE_KEYS.WHATSAPP_SETTINGS, {
    WHATSAPP_API_TOKEN: '',
    WHATSAPP_BUSINESS_PHONE_NUMBER: ''
  });

export const setWhatsAppSettings = (settings: Partial<WhatsAppSettings>) => {
  const current = getWhatsAppSettings();
  setItem(STORAGE_KEYS.WHATSAPP_SETTINGS, { ...current, ...settings });
};

// Google Calendar Settings
export const getGoogleCalendarSettings = (): GoogleCalendarSettings =>
  getItem<GoogleCalendarSettings>(STORAGE_KEYS.GOOGLE_CALENDAR_SETTINGS, {
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: ''
  });

export const setGoogleCalendarSettings = (settings: Partial<GoogleCalendarSettings>) => {
  const current = getGoogleCalendarSettings();
  setItem(STORAGE_KEYS.GOOGLE_CALENDAR_SETTINGS, { ...current, ...settings });
};

// Social Media Settings
export const getSocialMediaSettings = (): SocialMediaSettings =>
  getItem<SocialMediaSettings>(STORAGE_KEYS.SOCIAL_MEDIA_SETTINGS, {
    FACEBOOK_APP_ID: '',
    FACEBOOK_APP_SECRET: '',
    INSTAGRAM_ACCESS_TOKEN: ''
  });

export const setSocialMediaSettings = (settings: Partial<SocialMediaSettings>) => {
  const current = getSocialMediaSettings();
  setItem(STORAGE_KEYS.SOCIAL_MEDIA_SETTINGS, { ...current, ...settings });
};

// Products
export const getProducts = (): Product[] =>
  getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);

export const addProduct = (product: InsertProduct): Product => {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Product;
  setItem(STORAGE_KEYS.PRODUCTS, [...products, newProduct]);
  return newProduct;
};

// Product Groups
export const getProductGroups = (): ProductGroup[] =>
  getItem<ProductGroup[]>(STORAGE_KEYS.PRODUCT_GROUPS, []);

export const addProductGroup = (group: InsertProductGroup): ProductGroup => {
  const groups = getProductGroups();
  const newGroup = {
    ...group,
    id: groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1,
    createdAt: new Date()
  } as ProductGroup;
  setItem(STORAGE_KEYS.PRODUCT_GROUPS, [...groups, newGroup]);
  return newGroup;
};

// Customers
export const getCustomers = (): Customer[] =>
  getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);

export const addCustomer = (customer: InsertCustomer): Customer => {
  const customers = getCustomers();
  const newCustomer = {
    ...customer,
    id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
    createdAt: new Date()
  } as Customer;
  setItem(STORAGE_KEYS.CUSTOMERS, [...customers, newCustomer]);
  return newCustomer;
};

// Invoices
export const getInvoices = (): Invoice[] =>
  getItem<Invoice[]>(STORAGE_KEYS.INVOICES, []);

export const addInvoice = (invoice: InsertInvoice): Invoice => {
  const invoices = getInvoices();
  const newInvoice = {
    ...invoice,
    id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
    date: new Date(),
    createdAt: new Date()
  } as Invoice;
  setItem(STORAGE_KEYS.INVOICES, [...invoices, newInvoice]);
  return newInvoice;
};

// Expenses
export const getExpenses = (): Expense[] =>
  getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []);

export const addExpense = (expense: InsertExpense): Expense => {
  const expenses = getExpenses();
  const newExpense = {
    ...expense,
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Expense;
  setItem(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
  return newExpense;
};

// Expense Categories
export const getExpenseCategories = (): ExpenseCategory[] =>
  getItem<ExpenseCategory[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, []);

export const addExpenseCategory = (category: InsertExpenseCategory): ExpenseCategory => {
  const categories = getExpenseCategories();
  const newCategory = {
    ...category,
    id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
    createdAt: new Date()
  } as ExpenseCategory;
  setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, [...categories, newCategory]);
  return newCategory;
};

// Suppliers
export const getSuppliers = (): Supplier[] =>
  getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);

export const addSupplier = (supplier: InsertSupplier): Supplier => {
  const suppliers = getSuppliers();
  const newSupplier = {
    ...supplier,
    id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
    createdAt: new Date()
  } as Supplier;
  setItem(STORAGE_KEYS.SUPPLIERS, [...suppliers, newSupplier]);
  return newSupplier;
};


// Purchase Orders
export const getPurchaseOrders = (): PurchaseOrder[] =>
  getItem<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);

export const addPurchaseOrder = (purchaseOrder: InsertPurchaseOrder): PurchaseOrder => {
  const purchaseOrders = getPurchaseOrders();
  const newPurchaseOrder = {
    ...purchaseOrder,
    id: purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(p => p.id)) + 1 : 1,
    createdAt: new Date()
  } as PurchaseOrder;
  setItem(STORAGE_KEYS.PURCHASE_ORDERS, [...purchaseOrders, newPurchaseOrder]);
  return newPurchaseOrder;
};

// Users and Authentication
export const getUsers = (): User[] =>
  getItem<User[]>(STORAGE_KEYS.USERS, []);

export const addUser = (user: InsertUser): User => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    role: 'staff'
  } as User;
  setItem(STORAGE_KEYS.USERS, [...users, newUser]);
  return newUser;
};

// Staff
export const getStaff = (): Staff[] =>
  getItem<Staff[]>(STORAGE_KEYS.STAFF, []);

export const addStaff = (staff: InsertStaff): Staff => {
  const staffMembers = getStaff();
  const newStaff = {
    ...staff,
    id: staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) + 1 : 1
  } as Staff;
  setItem(STORAGE_KEYS.STAFF, [...staffMembers, newStaff]);
  return newStaff;
};

// Appointments
export const getAppointments = (): Appointment[] =>
  getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);

export const addAppointment = (appointment: InsertAppointment): Appointment => {
  const appointments = getAppointments();
  const newAppointment = {
    ...appointment,
    id: appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1,
  } as Appointment;
  setItem(STORAGE_KEYS.APPOINTMENTS, [...appointments, newAppointment]);
  return newAppointment;
};

// Currency conversion functions
export const convertCurrency = (amount: number, fromUSD = true): number => {
  const settings = getStoreSettings();
  const rate = settings.currencySettings?.usdToIqdRate || 1460;
  return fromUSD ? amount * rate : amount / rate;
};

export const formatCurrency = (amount: number, showBoth = false): string => {
  const settings = getStoreSettings();
  const rate = settings.currencySettings?.usdToIqdRate || 1460;

  if (showBoth) {
    const usdAmount = settings.currencySettings?.defaultCurrency === 'IQD' ? amount / rate : amount;
    const iqdAmount = settings.currencySettings?.defaultCurrency === 'USD' ? amount * rate : amount;
    return `${usdAmount.toFixed(2)} دولار | ${iqdAmount.toFixed(2)} دينار`;
  }

  const currency = settings.currencySettings?.defaultCurrency || 'USD';
  return currency === 'USD'
    ? `${amount.toFixed(2)} دولار`
    : `${amount.toFixed(2)} دينار`;
};