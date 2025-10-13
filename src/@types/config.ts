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
}
