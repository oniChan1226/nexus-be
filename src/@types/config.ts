import type { SignOptions } from "jsonwebtoken";

// types/config.ts
export interface JWTConfig {
  secret: string;
  expiresIn: SignOptions["expiresIn"];
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
}
