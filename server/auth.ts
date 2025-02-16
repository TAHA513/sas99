import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
    }
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStoreSession = MemoryStore(session);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // إعداد جلسات المستخدمين
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // تنظيف الجلسات المنتهية كل 24 ساعة
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
      httpOnly: true
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // إستراتيجية تسجيل الدخول
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "اسم المستخدم غير صحيح" });
        }

        if (!user.isActive) {
          return done(null, false, { message: "هذا الحساب معطل" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }

        // تحديث آخر تسجيل دخول
        await storage.updateUser(user.id, { lastLogin: new Date() });

        return done(null, {
          id: user.id,
          username: user.username,
          role: user.role
        });
      } catch (error) {
        console.error("خطأ في المصادقة:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }

      done(null, {
        id: user.id,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      console.error("خطأ في استرجاع بيانات المستخدم:", error);
      done(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("خطأ في تسجيل الدخول:", err);
        return res.status(500).json({ error: "حدث خطأ في النظام" });
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || "فشل تسجيل الدخول" });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("خطأ في جلسة تسجيل الدخول:", err);
          return res.status(500).json({ error: "حدث خطأ في تسجيل الدخول" });
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("خطأ في تسجيل الخروج:", err);
        return res.status(500).json({ error: "حدث خطأ في تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "المستخدم غير مصرح له" });
    }
    res.json(req.user);
  });

  // نقطة نهاية لتغيير كلمة المرور
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { username, oldPassword, newPassword } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      const isValidPassword = await comparePasswords(oldPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error("خطأ في تغيير كلمة المرور:", error);
      res.status(500).json({ error: "حدث خطأ في تغيير كلمة المرور" });
    }
  });
}