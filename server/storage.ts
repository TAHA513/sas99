import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }
}

export const storage = new DatabaseStorage();