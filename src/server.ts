// src/server.ts
import logger from "./config/logger";
import app from "./app";
import { connectDB } from "./config";
import { config } from "./config/env";
import { getRedisConnection, closeRedisConnection } from "./queues/connection";
import { bootstrapQueues } from "queues";

const startServer = async () => {
  try {
    // 1️⃣ Connect MongoDB
    await connectDB();

    // 2️⃣ Connect Redis (shared connection for all queues)
    await getRedisConnection();

    await bootstrapQueues();

    // 3️⃣ Start HTTP server
    const server = app.listen(config.MAIN.port, () => {
      logger.info(`🚀 Server running at http://localhost:${config.MAIN.port}`);
    });

    // 4️⃣ Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("🛑 Gracefully shutting down...");
      server.close();
      await closeRedisConnection();
      process.exit(0);
    });
  } catch (err) {
    logger.error("❌ Startup failed:", err);
    process.exit(1);
  }
};

startServer();
