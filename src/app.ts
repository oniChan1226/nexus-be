import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import routes from "./routes";
import logger from "./config/logger";
import { ErrorMiddleware } from "./middlewares/errorHandler";
import { ApiResponse } from "./utils/ApiResponse";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

const app: Application = express();

// Middlewares
app.use(cors());
app.use(
  express.json({
    limit: "1MB",
  })
);
app.use(cookieParser());

// Morgan + Winston logging
const stream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream }));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Mery Karan Arjun",
    environment: config.MAIN.nodeEnv,
  });
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    status: "OK",
    message: "Server is healthy and running smoothly.",
    environment: config.MAIN.nodeEnv,
    uptime: `${process.uptime().toFixed(2)} seconds`,
    timestamp: new Date().toISOString(),
    memoryUsage: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
        2
      )} MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(
        2
      )} MB`,
    },
    pid: process.pid,
    version: process.env.npm_package_version || "unknown",
  });
});

// API routes
app.use(config.API.prefix, routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json(new ApiResponse<null>(404, "Route not found"));
});

// Global error handler
app.use(ErrorMiddleware);

export default app;
