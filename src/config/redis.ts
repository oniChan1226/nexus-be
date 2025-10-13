import type { RedisOptions } from "ioredis";
import { config } from "./env";

export const redisOptions: RedisOptions = {
  host: config.REDIS.host,
  port: Number(config.REDIS.port),
  username: config.REDIS.username,
  password: config.REDIS.password,
  db: Number(config.REDIS.db),
  tls: config.REDIS.tls ? {} : undefined, // enable TLS if set (for cloud)
  maxRetriesPerRequest: null, // BullMQ recommended
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    console.warn("[Redis] reconnecting due to error:", err.message);
    return true;
  },
};
