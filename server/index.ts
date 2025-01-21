import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import { startStatisticsServer } from "./grpc/statistics-server";
import { db } from "@db";
import { eq, sql } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Healthcheck endpoint for Cloud Run
app.get("/_health", (req, res) => {
  res.status(200).send("OK");
});

(async () => {
  // Log environment variables (excluding sensitive data)
  log("Starting server with configuration:");
  log(`NODE_ENV: ${process.env.NODE_ENV}`);
  log(`PORT: ${process.env.PORT || 8080}`);
  log(`Database Host: ${process.env.PGHOST}`);
  log(`Database Name: ${process.env.PGDATABASE}`);

  // Verificar conexión a la base de datos
  try {
    // Realizar una consulta simple para verificar la conexión
    const result = await db.execute(sql`SELECT 1`);
    log("Database connection successful");
  } catch (error) {
    log(`Database connection failed: ${error}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1); // En producción, fallar rápido si no hay conexión a BD
    }
  }

  // Configurar autenticación antes de las rutas
  setupAuth(app);
  const server = registerRoutes(app);

  // En producción, no iniciamos el servidor gRPC
  if (process.env.NODE_ENV !== "production") {
    const GRPC_PORT = parseInt(process.env.GRPC_PORT || "50051");
    log(`Starting gRPC server on port ${GRPC_PORT}`);
    startStatisticsServer(GRPC_PORT);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${status} - ${message}`);
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Usar el puerto proporcionado por Cloud Run o el valor por defecto
  const PORT = parseInt(process.env.PORT || "8080");

  try {
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server is running on port ${PORT}`);
      log(`Environment: ${app.get("env")}`);
      log("Server started successfully");
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})().catch((error) => {
  log(`Unhandled error during startup: ${error}`);
  process.exit(1);
});