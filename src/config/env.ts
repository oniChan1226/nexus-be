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
};
