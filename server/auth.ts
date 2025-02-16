import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // إعداد الجلسة
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // إستراتيجية المصادقة المحلية
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (!username || !password) {
          return done(null, false, { message: "يجب إدخال اسم المستخدم وكلمة المرور" });
        }

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
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
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
      done(null, user);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  // نقاط نهاية API
  app.post("/api/login", (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ error: "يجب إدخال اسم المستخدم وكلمة المرور" });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "حدث خطأ في النظام" });
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || "فشل تسجيل الدخول" });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
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

  app.post("/api/logout", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "المستخدم غير مسجل الدخول" });
    }

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "حدث خطأ في تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

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