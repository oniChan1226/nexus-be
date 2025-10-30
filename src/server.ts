// src/server.ts
import { createServer } from "http";
import logger from "./config/logger";
import app from "./app";
import { connectDB } from "./config";
import { config } from "./config/env";
import { getRedisConnection, closeRedisConnection } from "./queues/connection";
import { bootstrapQueues } from "queues";
import { socketManager } from "./socket";

const startServer = async () => {
  try {
    // 1️⃣ Connect MongoDB
    await connectDB();

    // 2️⃣ Connect Redis (shared connection for all queues)
    await getRedisConnection();

    await bootstrapQueues();

    // 3️⃣ Create HTTP server
    const httpServer = createServer(app);

    // 4️⃣ Initialize Socket.IO
    await socketManager.initialize(httpServer);

    // 5️⃣ Start HTTP server
    const server = httpServer.listen(config.MAIN.port, () => {
      logger.info(`🚀 Server running at http://localhost:${config.MAIN.port}`);
      logger.info(`🔌 Socket.IO server running on the same port`);
    });

    // 6️⃣ Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("🛑 Gracefully shutting down...");
      
      // Shutdown Socket.IO first
      await socketManager.shutdown();
      
      // Close HTTP server
      server.close();
      
      // Close Redis connection
      await closeRedisConnection();
      
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("🛑 Received SIGTERM, shutting down...");
      
      await socketManager.shutdown();
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
