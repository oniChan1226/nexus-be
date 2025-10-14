// src/queues/connection.ts
import { Redis } from "ioredis";
import { redisOptions } from "../config/redis";
import logger from "config/logger";

let redisInstance: Redis | null = null;

/**
 * Returns a shared Redis connection instance for BullMQ.
 * Waits until Redis is fully ready before resolving.
 */
export async function getRedisConnection(): Promise<Redis> {
  if (!redisInstance) {
    redisInstance = new Redis(redisOptions);

    redisInstance.on("connect", () => {
      logger.info(
        `[Redis] Connected to ${redisOptions.host}:${redisOptions.port}`
      );
    });

    redisInstance.on("error", (err) => {
      logger.error("[Redis] Error:", err);
    });

    redisInstance.on("reconnecting", () => {
      logger.warn("[Redis] Reconnecting...");
    });

    // Wait until Redis is ready
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        redisInstance!.once("ready", resolve);
        redisInstance!.once("error", reject);
      }),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), 5000)
      ),
    ]);
  }

  return redisInstance;
}

/** Graceful shutdown */
export async function closeRedisConnection() {
  if (redisInstance) {
    await redisInstance.quit();
    logger.info("[Redis] Connection closed.");
    redisInstance = null;
  }
}
