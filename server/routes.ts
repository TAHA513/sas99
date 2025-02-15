import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertAppointmentSchema, insertStaffSchema, insertSettingSchema, insertMarketingCampaignSchema, insertPromotionSchema, insertDiscountCodeSchema, insertProductSchema, insertProductGroupSchema } from "@shared/schema";
import { notificationService } from './services/notification-service';
import express from 'express';

export async function registerRoutes(app: Express): Promise<Server> {
  // Staff Dashboard APIs
  app.get("/api/sales/today", async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoices = await storage.getInvoices();
    const todaySales = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= today;
    });

    const total = todaySales.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

    res.json({
      total,
      count: todaySales.length,
      items: todaySales,
    });
  });

  app.get("/api/appointments/today", async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await storage.getAppointments();
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= today && aptDate < tomorrow;
    });

    res.json(todayAppointments);
  });

  app.get("/api/products/low-stock", async (_req, res) => {
    const products = await storage.getProducts();
    const lowStock = products.filter(product => Number(product.quantity) < 10);

    res.json(lowStock);
  });

  const httpServer = createServer(app);
  return httpServer;
}