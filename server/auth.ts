import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { and, eq, gt } from 'knex';


declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      ip: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Improved password hashing with stronger parameters
async function hashPassword(password: string) {
  const salt = randomBytes(32).toString("hex"); // Increased salt length
  const keyLength = 64; // Increased key length
  const iterations = 16384; // Increased number of iterations

  const buf = (await scryptAsync(password, salt, keyLength, { N: iterations })) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const iterations = 16384;
  const keyLength = 64;

  const suppliedBuf = (await scryptAsync(supplied, salt, keyLength, { N: iterations })) as Buffer;

  if (hashedBuf.length !== suppliedBuf.length) {
    return false;
  }

  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Check login attempts
async function checkLoginAttempts(username: string, ipAddress: string) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const recentAttempts = await storage.db.select()
    .from('loginAttempts')
    .where(and(
      eq('username', username),
      eq('ipAddress', ipAddress),
      eq('success', false),
      gt('timestamp', fiveMinutesAgo)
    ));

  return recentAttempts.length >= 3;
}

// Record login attempt
async function recordLoginAttempt(username: string, ipAddress: string, success: boolean) {
  await storage.db.insert('loginAttempts').values({
    username,
    ipAddress,
    success,
    timestamp: new Date(),
  });
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const ipAddress = (req as Request).ip;

        // Check failed login attempts
        const isBlocked = await checkLoginAttempts(username, ipAddress);
        if (isBlocked) {
          await recordLoginAttempt(username, ipAddress, false);
          return done(null, false, { message: "Account temporarily blocked due to too many failed attempts" });
        }

        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          await recordLoginAttempt(username, ipAddress, false);
          return done(null, false, { message: "Incorrect username or password" });
        }

        await recordLoginAttempt(username, ipAddress, true);
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

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}