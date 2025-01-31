import { type Express } from "express";
import { type Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.REPL_ID || "your-secret-key";

const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

// Middleware to verify JWT
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

declare global {
  namespace Express {
    interface User extends typeof users.$inferSelect {}
  }
}

export function setupAuth(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validación de campos
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username is required and must be a string" });
      }
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: "Password is required and must be a string" });
      }

      // Verificar si el usuario ya existe
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Crear nuevo usuario
      const hashedPassword = await crypto.hash(password);
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      // Generar token y enviar respuesta
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
      return res.json({
        message: "Registration successful",
        token,
        user: { id: newUser.id, username: newUser.username }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: "An error occurred during registration" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validación de campos
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username is required and must be a string" });
      }
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: "Password is required and must be a string" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await crypto.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: "An error occurred during login" });
    }
  });

  app.get("/api/user", requireAuth, (req, res) => {
    res.json(req.user);
  });
}