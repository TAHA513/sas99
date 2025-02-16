import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
      items: todaySales.map(invoice => ({
        id: invoice.id,
        amount: invoice.finalTotal,
        date: invoice.date,
        status: invoice.status,
        customerName: invoice.customerName
      }))
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

    // Get customer details for each appointment
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

    // Get group details for each product
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

  // إضافة API للإحصائيات السريعة للموظفين
  app.get("/api/staff/quick-stats", async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // الحصول على إجمالي المبيعات
    const invoices = await storage.getInvoices();
    const todaySales = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= today;
    });
    const totalSales = todaySales.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

    // الحصول على عدد المواعيد
    const appointments = await storage.getAppointments();
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= today;
    });

    // الحصول على المنتجات منخفضة المخزون
    const products = await storage.getProducts();
    const lowStockCount = products.filter(product => Number(product.quantity) < 10).length;

    res.json({
      totalSales,
      appointmentsCount: todayAppointments.length,
      lowStockCount,
      salesCount: todaySales.length
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}