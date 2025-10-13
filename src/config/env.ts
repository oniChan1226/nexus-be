// config/index.ts
import dotenv from "dotenv";
import { AppConfig } from "../@types/config";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

export const config: AppConfig = {
  MAIN: {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI || "",
    dbName: process.env.DB_NAME,
  },
  API: {
    prefix: "/api",
  },
  JWT: {
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET || "default_access_secret",
      expiresIn:
        (process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"]) || "15m",
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
      expiresIn:
        (process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"]) || "7d",
    },
  },
  REDIS: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
    tls: process.env.REDIS_TLS === "true",
  },

  BULLMQ: {
    prefix: process.env.BULLMQ_PREFIX || "bullmq",
    maxRetries: Number(process.env.BULLMQ_MAX_RETRIES) || 3,
    backoffDelay: Number(process.env.BULLMQ_BACKOFF_DELAY) || 1000,
  },
};
