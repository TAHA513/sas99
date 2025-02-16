import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
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
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "اسم المستخدم غير صحيح" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }

        return done(null, user);
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
      done(null, user);
    } catch (error) {
      console.error("خطأ في استرجاع بيانات المستخدم:", error);
      done(error);
    }
  });

  // نقطة نهاية تسجيل الدخول
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
        return res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        });
      });
    })(req, res, next);
  });

  // نقطة نهاية تسجيل الخروج
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("خطأ في تسجيل الخروج:", err);
        return res.status(500).json({ error: "حدث خطأ في تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // نقطة نهاية الحصول على بيانات المستخدم الحالي
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "المستخدم غير مصرح له" });
    }

    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    });
  });
}