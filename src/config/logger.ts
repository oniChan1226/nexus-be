// src/config/logger.ts
import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(__dirname, "../../logs");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Helper to safely stringify circular structures
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };
};

const safeStringify = (data: any) => {
  try {
    return JSON.stringify(data, getCircularReplacer(), 2);
  } catch {
    return String(data);
  }
};

// === Custom formatting ===
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const msg = stack || message;
    const metaString =
      Object.keys(meta).length > 0 ? safeStringify(meta) : "";
    return `\n${timestamp} [${level}] ${msg}\n${metaString}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const msg = stack || message;
    const metaString =
      Object.keys(meta).length > 0 ? safeStringify(meta) : "";
    return `${timestamp} [${level.toUpperCase()}]: ${msg}\n${metaString}\n`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.errors({ stack: true }),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// Add console only in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;
