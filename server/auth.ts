import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

async function logLoginAttempt(username: string, success: boolean, ip: string) {
  await storage.createLoginLog({
    username,
    success,
    ip,
    timestamp: new Date(),
  });
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Try finding user by username or email for admins
        const user = await storage.getUserByUsername(username) || 
                    await storage.getUserByEmail(username);

        const success = user && await comparePasswords(password, user.password);
        await logLoginAttempt(username, !!success, "system");

        if (!success) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Update last login time
        await storage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register new user (admin only)
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if requester is admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can create new users" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username) || 
                          await storage.getUserByEmail(req.body.email);

      if (existingUser) {
        return res.status(400).json({ error: "Username or email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.username;
    req.logout((err) => {
      if (err) return next(err);
      if (username) {
        logLoginAttempt(username, true, "system");
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // User management endpoints (admin only)
  app.get("/api/users", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const users = await storage.getUsers();
    res.json(users);
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const userId = parseInt(req.params.id);

    // Prevent deleting the last admin
    if (req.user.id === userId) {
      const admins = await storage.getAdminCount();
      if (admins <= 1) {
        return res.status(400).json({ error: "Cannot delete the last admin user" });
      }
    }

    await storage.deleteUser(userId);
    res.sendStatus(200);
  });
}