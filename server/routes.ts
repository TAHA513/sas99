import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for handling JSON responses
  app.use(express.json());

  // Staff Dashboard APIs
  app.get("/api/sales/today", async (_req, res) => {
    try {
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
        items: todaySales.map(invoice => ({
          id: invoice.id,
          amount: invoice.finalTotal,
          date: invoice.date,
          status: 'completed',
          customerName: invoice.customerName
        }))
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات المبيعات" });
    }
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

    const appointmentsWithDetails = await Promise.all(
      todayAppointments.map(async (apt) => {
        const customer = await storage.getCustomer(apt.customerId);
        return {
          ...apt,
          customerName: customer?.name,
          customerPhone: customer?.phone
        };
      })
    );

    res.json(appointmentsWithDetails);
  });

  app.get("/api/products/low-stock", async (_req, res) => {
    const products = await storage.getProducts();
    const lowStock = products.filter(product => Number(product.quantity) < 10);

    const productsWithGroups = await Promise.all(
      lowStock.map(async (product) => {
        const group = await storage.getProductGroup(product.groupId);
        return {
          ...product,
          groupName: group?.name
        };
      })
    );

    res.json(productsWithGroups);
  });

  app.get("/api/inventory/stats", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      const lowStockProducts = products.filter(product => Number(product.quantity) < 10);

      // Get today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const invoices = await storage.getInvoices();
      const todaysSales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= today;
      });

      const stats = {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        dailySales: todaysSales.length,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب إحصائيات المخزون" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}