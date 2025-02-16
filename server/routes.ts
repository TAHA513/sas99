import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import multer from 'multer';
import { backupService } from './services/backup-service';
import { randomBytes } from 'crypto';
import { comparePasswords, hashPassword } from './auth';

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Staff Authentication
  app.post("/api/staff/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).send("اسم المستخدم أو كلمة المرور غير صحيحة");
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).send("اسم المستخدم أو كلمة المرور غير صحيحة");
      }

      // Update last login
      await storage.updateUser(user.id, {
        lastLogin: new Date(),
      });

      // Get staff details
      const staffMember = await storage.getStaffByUserId(user.id);
      if (!staffMember) {
        return res.status(401).send("لم يتم العثور على بيانات الموظف");
      }

      res.json({
        id: staffMember.id,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send("حدث خطأ أثناء تسجيل الدخول");
    }
  });

  // Staff Management
  app.post("/api/staff", async (req, res) => {
    const { username, password, name, role, specialization } = req.body;

    try {
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("اسم المستخدم موجود مسبقاً");
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        role,
      });

      // Create staff member
      const staff = await storage.createStaff({
        userId: user.id,
        specialization,
        status: 'active',
      });

      res.status(201).json({ ...staff, user });
    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).send("حدث خطأ أثناء إنشاء الموظف");
    }
  });

  // Generate new token for staff
  app.post("/api/staff/:id/token", async (req, res) => {
    const { id } = req.params;

    try {
      const staff = await storage.getStaff(parseInt(id));
      if (!staff) {
        return res.status(404).send("لم يتم العثور على الموظف");
      }

      const token = randomBytes(32).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 30); // Token expires in 30 days

      await storage.updateUser(staff.userId, {
        authToken: token,
        tokenExpiry,
      });

      res.json({ token });
    } catch (error) {
      console.error('Generate token error:', error);
      res.status(500).send("حدث خطأ أثناء إنشاء الرمز");
    }
  });

  // Delete staff member
  app.delete("/api/staff/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const staff = await storage.getStaff(parseInt(id));
      if (!staff) {
        return res.status(404).send("لم يتم العثور على الموظف");
      }

      // Deactivate user instead of deleting
      await storage.updateUser(staff.userId, {
        active: false,
      });

      // Update staff status
      await storage.updateStaff(parseInt(id), {
        status: 'inactive',
      });

      res.status(200).send();
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).send("حدث خطأ أثناء حذف الموظف");
    }
  });

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

  // Backup and Restore endpoints
  app.post('/api/backup/generate', async (_req, res) => {
    try {
      const backupPath = await backupService.generateBackup();
      res.download(backupPath);
    } catch (error) {
      console.error('Error generating backup:', error);
      res.status(500).json({ error: 'فشل إنشاء النسخة الاحتياطية' });
    }
  });

  app.post('/api/backup/restore', upload.single('backup'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم تحميل أي ملف' });
      }

      await backupService.restoreBackup(req.file.path);
      res.json({ message: 'تم استعادة النسخة الاحتياطية بنجاح' });
    } catch (error) {
      console.error('Error restoring backup:', error);
      res.status(500).json({ error: 'فشل استعادة النسخة الاحتياطية' });
    }
  });

  app.get('/api/backup/schedule', async (_req, res) => {
    try {
      const schedule = backupService.getSchedule();
      res.json(schedule);
    } catch (error) {
      console.error('Error getting backup schedule:', error);
      res.status(500).json({ error: 'فشل جلب إعدادات النسخ الاحتياطي' });
    }
  });

  app.post('/api/backup/schedule', async (req, res) => {
    try {
      await backupService.updateSchedule(req.body);
      res.json({ message: 'تم تحديث إعدادات النسخ الاحتياطي بنجاح' });
    } catch (error) {
      console.error('Error updating backup schedule:', error);
      res.status(500).json({ error: 'فشل تحديث إعدادات النسخ الاحتياطي' });
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