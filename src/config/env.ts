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
  LINKEDIN: {
    client_id: process.env.CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    scope:
    "profile openid email w_member_social",
    // "r_liteprofile w_member_social rw_organization_admin r_organization_social w_organization_social",
    redirect_uri:
      process.env.LINKEDIN_REDIRECT_URI ||
      "http://localhost:8080/api/auth/linkedin/callback",
    auth_url: "https://www.linkedin.com/oauth/v2/authorization",
    token_url: "https://www.linkedin.com/oauth/v2/accessToken",
    ugc_posts_url: "https://api.linkedin.com/v2/ugcPosts",
    organization_urn: process.env.LINKEDIN_ORG_URN || "", // e.g. "urn:li:organization:123456"
  },

  SOCKETIO: {
    port: Number(process.env.SOCKETIO_PORT),
    cors: {
      origin: process.env.SOCKETIO_CORS_ORIGIN?.split(",") || ["http://localhost:3000", "http://localhost:8080"],
      credentials: process.env.SOCKETIO_CORS_CREDENTIALS === "true",
    },
    redis: {
      enabled: process.env.SOCKETIO_REDIS_ENABLED === "true",
      keyPrefix: process.env.SOCKETIO_REDIS_PREFIX || "socket.io",
    },
    rateLimit: {
      windowMs: Number(process.env.SOCKETIO_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
      maxRequests: Number(process.env.SOCKETIO_RATE_LIMIT_MAX_REQUESTS) || 100,
    },
    connection: {
      pingTimeout: Number(process.env.SOCKETIO_PING_TIMEOUT) || 60000,
      pingInterval: Number(process.env.SOCKETIO_PING_INTERVAL) || 25000,
      maxPayload: Number(process.env.SOCKETIO_MAX_PAYLOAD) || 1000000, // 1MB
    },
  },

  AI: {
    provider: (process.env.AI_PROVIDER as "openai" | "anthropic" | "gemini" | "ollama") || "openai",
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      defaultModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      baseUrl: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
      defaultModel: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      defaultModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      defaultModel: process.env.OLLAMA_MODEL || "llama2",
    },
    defaultTemperature: Number(process.env.AI_TEMPERATURE) || 0.7,
    defaultMaxTokens: Number(process.env.AI_MAX_TOKENS) || 1000,
  },
};
