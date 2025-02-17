import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import multer from 'multer';
import { backupService } from './services/backup-service';
import { db } from './db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const upload = multer({ dest: 'uploads/' });

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

  // Change Password
  app.post('/api/security/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword, userId } = req.body;

      // Check current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await storage.updateUserPassword(userId, hashedPassword);

      // Log activity
      await storage.logSecurityActivity({
        userId,
        action: 'password_change',
        timestamp: new Date(),
        ipAddress: req.ip,
      });

      res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'فشل تغيير كلمة المرور' });
    }
  });

  // Enable 2FA
  app.post('/api/security/2fa/enable', async (req, res) => {
    try {
      const { userId } = req.body;
      const secret = generateTOTPSecret();

      await storage.enable2FA(userId, secret);

      res.json({
        secret,
        qrCode: generateTOTPQRCode(secret),
      });
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      res.status(500).json({ error: 'فشل تفعيل المصادقة الثنائية' });
    }
  });

  // Fetch activity log
  app.get('/api/security/activity-log', async (req, res) => {
    try {
      const { userId } = req.query;
      const activities = await storage.getSecurityActivities(Number(userId));
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      res.status(500).json({ error: 'فشل جلب سجل الأنشطة' });
    }
  });

  // Revoke all sessions
  app.post('/api/security/sessions/revoke-all', async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.revokeAllSessions(userId);

      // Log activity
      await storage.logSecurityActivity({
        userId,
        action: 'revoke_all_sessions',
        timestamp: new Date(),
        ipAddress: req.ip,
      });

      res.json({ message: 'تم إنهاء جميع الجلسات بنجاح' });
    } catch (error) {
      console.error('Error revoking sessions:', error);
      res.status(500).json({ error: 'فشل إنهاء الجلسات' });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for 2FA
function generateTOTPSecret() {
  // Implementation for generating TOTP secret  (Replace with actual implementation)
  return 'base32-encoded-secret';
}

function generateTOTPQRCode(secret: string) {
  // Implementation for generating QR code (Replace with actual implementation)
  return `otpauth://totp/YourApp:${secret}`;
}