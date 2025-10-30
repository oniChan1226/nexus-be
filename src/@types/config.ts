import type { SignOptions } from "jsonwebtoken";

// types/config.ts
export interface JWTConfig {
  secret: string;
  expiresIn: SignOptions["expiresIn"];
}

export interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  tls?: boolean;
}

export interface BullMQConfig {
  prefix: string;
  maxRetries: number;
  backoffDelay: number;
}

export interface LinkedInConfig {
  client_id: string;
  client_secret: string;
  scope: string;  
  api_version?: string; // optional, e.g. "v2"
  base_url?: string; // optional, e.g. "https://api.linkedin.com"
  auth_url?: string; // optional, e.g. "https://www.linkedin.com/oauth/v2/authorization"
  token_url: string; // optional, e.g. "https://www.linkedin.com/oauth/v2/accessToken"
  organization_urn?: string; // if posting as a company, e.g. "urn:li:organization:123456"
  ugc_posts_url?: string; // if posting as a company, e.g. "urn:li:organization:123456"
  redirect_uri: string; // if posting as a company, e.g. "urn:li:organization:123456"
};

export interface SocketIOConfig {
  port?: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  redis: {
    enabled: boolean;
    keyPrefix: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  connection: {
    pingTimeout: number;
    pingInterval: number;
    maxPayload: number;
  };
}

export interface AppConfig {
  MAIN: {
    port: number;
    nodeEnv: string;
    mongoUri: string;
    dbName?: string;
  };
  API: {
    prefix: string;
  };
  JWT: {
    accessToken: JWTConfig;
    refreshToken: JWTConfig;
  };
  REDIS: RedisConfig;
  BULLMQ: BullMQConfig;
  LINKEDIN: LinkedInConfig;
  SOCKETIO: SocketIOConfig;
}
