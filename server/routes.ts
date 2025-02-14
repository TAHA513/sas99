import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertAppointmentSchema, insertStaffSchema, insertSettingSchema, insertMarketingCampaignSchema, insertPromotionSchema, insertDiscountCodeSchema } from "@shared/schema";
import { notificationService } from './services/notification-service';

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer routes
  app.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.post("/api/customers", async (req, res) => {
    const parsed = insertCustomerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const customer = await storage.createCustomer(parsed.data);
    res.status(201).json(customer);
  });

  app.patch("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const customer = await storage.updateCustomer(id, req.body);
    res.json(customer);
  });

  app.delete("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCustomer(id);
    res.sendStatus(204);
  });

  // Appointment routes
  app.get("/api/appointments", async (_req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post("/api/appointments", async (req, res) => {
    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const appointment = await storage.createAppointment(parsed.data);

    // Get customer and staff details for notifications
    const customer = await storage.getCustomer(appointment.customerId);
    const staffMember = await storage.getStaffMember(appointment.staffId);

    if (customer && staffMember) {
      // Send notifications asynchronously
      notificationService.handleAppointmentCreated(
        appointment,
        customer,
        staffMember
      ).catch(console.error);
    }

    res.status(201).json(appointment);
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const appointment = await storage.updateAppointment(id, req.body);

    // Get customer and staff details for notifications
    const customer = await storage.getCustomer(appointment.customerId);
    const staffMember = await storage.getStaffMember(appointment.staffId);

    if (customer && staffMember) {
      // Send notifications asynchronously
      notificationService.handleAppointmentUpdated(
        appointment,
        customer,
        staffMember
      ).catch(console.error);
    }

    res.json(appointment);
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteAppointment(id);
    res.sendStatus(204);
  });

  // Staff routes
  app.get("/api/staff", async (_req, res) => {
    const staff = await storage.getStaff();
    res.json(staff);
  });

  app.post("/api/staff", async (req, res) => {
    const parsed = insertStaffSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const staff = await storage.createStaff(parsed.data);
    res.status(201).json(staff);
  });

  app.patch("/api/staff/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const staff = await storage.updateStaff(id, req.body);
    res.json(staff);
  });

  app.delete("/api/staff/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteStaff(id);
    res.sendStatus(204);
  });

  // Settings routes
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    const parsed = insertSettingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const setting = await storage.setSetting(parsed.data.key, parsed.data.value);
    res.status(201).json(setting);
  });

  // Marketing Campaign routes
  app.get("/api/campaigns", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.post("/api/campaigns", async (req, res) => {
    const parsed = insertMarketingCampaignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const campaign = await storage.createCampaign(parsed.data);
    res.status(201).json(campaign);
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const campaign = await storage.updateCampaign(id, req.body);
    res.json(campaign);
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCampaign(id);
    res.sendStatus(204);
  });

  // Promotion routes
  app.get("/api/promotions", async (_req, res) => {
    const promotions = await storage.getPromotions();
    res.json(promotions);
  });

  app.post("/api/promotions", async (req, res) => {
    const parsed = insertPromotionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const promotion = await storage.createPromotion(parsed.data);
    res.status(201).json(promotion);
  });

  app.patch("/api/promotions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const promotion = await storage.updatePromotion(id, req.body);
    res.json(promotion);
  });

  app.delete("/api/promotions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePromotion(id);
    res.sendStatus(204);
  });

  // Discount Code routes
  app.get("/api/discount-codes", async (_req, res) => {
    const discountCodes = await storage.getDiscountCodes();
    res.json(discountCodes);
  });

  app.post("/api/discount-codes", async (req, res) => {
    const parsed = insertDiscountCodeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const discountCode = await storage.createDiscountCode(parsed.data);
    res.status(201).json(discountCode);
  });

  app.patch("/api/discount-codes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const discountCode = await storage.updateDiscountCode(id, req.body);
    res.json(discountCode);
  });

  app.delete("/api/discount-codes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteDiscountCode(id);
    res.sendStatus(204);
  });

  app.get("/api/discount-codes/validate/:code", async (req, res) => {
    const code = req.params.code;
    const discountCode = await storage.getDiscountCodeByCode(code);

    if (!discountCode) {
      return res.status(404).json({ message: "Discount code not found" });
    }

    if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Discount code has expired" });
    }

    if (discountCode.usageCount >= discountCode.usageLimit) {
      return res.status(400).json({ message: "Discount code usage limit reached" });
    }

    res.json(discountCode);
  });

  // Theme routes
  app.post("/api/theme", async (req, res) => {
    const { primary, variant, radius } = req.body;
    try {
      const fs = require('fs/promises');
      const path = require('path');

      // Read current theme
      const themePath = path.join(process.cwd(), 'theme.json');
      const currentTheme = JSON.parse(await fs.readFile(themePath, 'utf8'));

      // Update theme with new values while preserving other settings
      const newTheme = {
        ...currentTheme,
        ...(primary && { primary }),
        ...(variant && { variant }),
        ...(radius && { radius }),
      };

      // Write updated theme
      await fs.writeFile(themePath, JSON.stringify(newTheme, null, 2));

      res.json(newTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({ error: 'Failed to update theme' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}