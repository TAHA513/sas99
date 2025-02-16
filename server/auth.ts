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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

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

  passport.serializeUser((user, done) => done(null, user.id));
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

  app.post("/api/login", (req, res, next) => {
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
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    try {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ error: "حدث خطأ في تسجيل الخروج" });
        }
        res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "حدث خطأ غير متوقع في تسجيل الخروج" });
    }
  });

  app.get("/api/user", (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "المستخدم غير مصرح له" });
      }
      res.json(req.user);
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ error: "حدث خطأ في جلب بيانات المستخدم" });
    }
  });
}