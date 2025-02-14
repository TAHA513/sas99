import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
  name: text("name").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  staffId: integer("staff_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  specialization: text("specialization"),
  workDays: text("work_days").array(),
  workHours: text("work_hours").array(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull(),
  storeLogo: text("store_logo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("draft"),
  type: text("type").notNull(),
  content: text("content").notNull(),
  platforms: text("platforms").array(),
  socialMediaSettings: text("social_media_settings"),
  targetAudience: text("target_audience"),
  budget: integer("budget"),
  messageCount: integer("message_count").notNull().default(0),
  adCreatives: text("ad_creatives").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  promotionId: integer("promotion_id").notNull(),
  customerId: integer("customer_id"),
  usageLimit: integer("usage_limit").notNull().default(1),
  usageCount: integer("usage_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productGroups = pgTable("product_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  barcode: text("barcode"),
  type: text("type").notNull(),
  quantity: decimal("quantity").notNull().default("0"),
  costPrice: decimal("cost_price").notNull(),
  sellingPrice: decimal("selling_price").notNull(),
  groupId: integer("group_id").notNull(),
  isWeighted: boolean("is_weighted").notNull().default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name"),
  items: json("items").$type<{
    productId: number;
    quantity: number;
    price: number;
    total: number;
  }[]>().notNull(),
  subtotal: decimal("subtotal").notNull(),
  discount: decimal("discount").notNull().default("0"),
  discountAmount: decimal("discount_amount").notNull().default("0"),
  finalTotal: decimal("final_total").notNull(),
  note: text("note"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const insertCustomerSchema = createInsertSchema(customers);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertStaffSchema = createInsertSchema(staff);
export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});
export const insertStoreSettingsSchema = createInsertSchema(storeSettings).pick({
  storeName: true,
  storeLogo: true,
});
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).extend({
  platforms: z.array(z.enum(['facebook', 'instagram', 'snapchat', 'whatsapp', 'email', 'sms'])).optional(),
  socialMediaSettings: z.string().optional(),
  targetAudience: z.string().optional(),
  adCreatives: z.array(z.string()).optional(),
  budget: z.number().optional(),
});
export const insertPromotionSchema = createInsertSchema(promotions);
export const insertDiscountCodeSchema = createInsertSchema(discountCodes);
export const insertSocialMediaAccountSchema = createInsertSchema(socialMediaAccounts).pick({
  platform: true,
  username: true,
  password: true,
});

export const insertProductGroupSchema = createInsertSchema(productGroups).pick({
  name: true,
  description: true,
});

export const insertProductSchema = createInsertSchema(products).extend({
  barcode: z.string().optional(),
  type: z.enum(["piece", "weight"]),
  quantity: z.number().min(0),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  groupId: z.number(),
  isWeighted: z.boolean(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).extend({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number(),
    total: z.number()
  })),
  subtotal: z.number(),
  discount: z.number(),
  discountAmount: z.number(),
  finalTotal: z.number(),
  note: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type StoreSetting = typeof storeSettings.$inferSelect;
export type InsertStoreSetting = z.infer<typeof insertStoreSettingsSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = z.infer<typeof insertSocialMediaAccountSchema>;
export type ProductGroup = typeof productGroups.$inferSelect;
export type InsertProductGroup = z.infer<typeof insertProductGroupSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;