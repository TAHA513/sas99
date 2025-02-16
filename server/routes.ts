import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import { hashPassword, comparePasswords } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for handling JSON responses
  app.use(express.json());
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Simple login endpoint without passport
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          error: "يجب إدخال اسم المستخدم وكلمة المرور" 
        });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ 
          error: "اسم المستخدم غير صحيح" 
        });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: "كلمة المرور غير صحيحة" 
        });
      }

      // Store user info in session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      };

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        error: "حدث خطأ في تسجيل الدخول" 
      });
    }
  });

  // Simple logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ 
          error: "حدث خطأ في تسجيل الخروج" 
        });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ 
        error: "المستخدم غير مسجل الدخول" 
      });
    }
    res.json(user);
  });

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

  // Admin credentials management
  app.post("/api/admin/credentials", async (req, res) => {
    try {
      const { username, password, name } = req.body;

      // التحقق من وجود المستخدم
      const existingAdmin = await storage.getUserByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      // إنشاء مستخدم جديد بصلاحيات المدير
      const hashedPassword = await hashPassword(password);
      const adminUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: "admin",
        name: name || null, // إضافة الاسم إذا تم توفيره
      });

      res.status(201).json({ 
        message: "تم إنشاء حساب المدير بنجاح",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.name
        }
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      res.status(500).json({ 
        message: "حدث خطأ أثناء إنشاء حساب المدير",
        error: error.message 
      });
    }
  });

  // Staff credentials management
  app.post("/api/staff/credentials", async (req, res) => {
    try {
      const { username, password, staffId, name } = req.body;

      // التحقق من وجود المستخدم
      const existingStaff = await storage.getUserByUsername(username);
      if (existingStaff) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      // إنشاء مستخدم جديد بصلاحيات الموظف
      const hashedPassword = await hashPassword(password);
      const staffUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: "staff",
        staffId: staffId || null,
        name: name || null, // إضافة الاسم إذا تم توفيره
      });

      res.status(201).json({ 
        message: "تم إنشاء حساب الموظف بنجاح",
        user: {
          id: staffUser.id,
          username: staffUser.username,
          role: staffUser.role,
          staffId: staffUser.staffId,
          name: staffUser.name
        }
      });
    } catch (error: any) {
      console.error('Error creating staff:', error);
      res.status(500).json({ 
        message: "حدث خطأ أثناء إنشاء حساب الموظف",
        error: error.message 
      });
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

  // Delete user account
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      await storage.deleteUser(userId);
      res.status(200).json({ message: "تم حذف الحساب بنجاح" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "حدث خطأ أثناء حذف الحساب" });
    }
  });

  // Get all users
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        staffId: user.staffId,
        createdAt: user.createdAt
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب قائمة المستخدمين" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}