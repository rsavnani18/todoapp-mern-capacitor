import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import todoRoutes from "./routes/todo.routes.js";

const app: Application = express();

// Render / Reverse Proxy ke peeche real client IP detect karne ke liye zaroori
app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// Multi-Origin CORS (Vercel + Localhost + Capacitor Android/iOS)
const envOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...envOrigins,
  "http://localhost:5173",
  "https://localhost",
  "capacitor://localhost",
  "http://localhost",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Strict Auth Rate Limiter (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Body & Cookie Parsers
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Health Check Route (Render uptime monitoring ke liye)
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running smoothly",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// 404 Not Found Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const isCorsError = err.message.startsWith("CORS blocked");
  const statusCode = isCorsError ? 403 : 500;

  if (statusCode === 500) {
    console.error("❌ Unhandled Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : err.message,
  });
});

export default app;
