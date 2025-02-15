// Local storage keys
const STORAGE_KEYS = {
  STORE_SETTINGS: 'store-settings',
  SOCIAL_ACCOUNTS: 'social-accounts',
  WHATSAPP_SETTINGS: 'whatsapp-settings',
  GOOGLE_CALENDAR_SETTINGS: 'google-calendar-settings',
  SOCIAL_MEDIA_SETTINGS: 'social-media-settings',
} as const;

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

// Helper function to convert currency
export const convertCurrency = (amount: number, fromUSD = true): number => {
  const settings = getStoreSettings();
  const rate = settings.currencySettings?.usdToIqdRate || 1460;

  return fromUSD ? amount * rate : amount / rate;
};