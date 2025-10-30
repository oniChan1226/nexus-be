// src/config/socket.ts
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, ServerOptions } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { config } from "./env";
import logger from "./logger";
import { getRedisConnection } from "../queues/connection";

/**
 * Creates and configures Socket.IO server with production-ready settings
 */
export const createSocketServer = async (httpServer: HTTPServer): Promise<SocketIOServer> => {
  const socketConfig: Partial<ServerOptions> = {
    // CORS configuration for cross-origin requests
    cors: config.SOCKETIO.cors,
    
    // Connection settings for reliability
    pingTimeout: config.SOCKETIO.connection.pingTimeout,
    pingInterval: config.SOCKETIO.connection.pingInterval,
    maxHttpBufferSize: config.SOCKETIO.connection.maxPayload,
    
    // Allow upgrades from polling to WebSocket
    allowUpgrades: true,
    
    // Transports priority (WebSocket preferred)
    transports: ["websocket", "polling"],
    
    // Allow EIO3 for compatibility
    allowEIO3: true,
    
    // HTTP long-polling options
    httpCompression: true,
    
    // Cookie settings
    cookie: {
      name: "io",
      httpOnly: true,
      sameSite: "strict",
    },
  };

  const io = new SocketIOServer(httpServer, socketConfig);

  // Set up Redis adapter for horizontal scaling if enabled
  if (config.SOCKETIO.redis.enabled) {
    try {
      const redisClient = await getRedisConnection();
      const subClient = redisClient.duplicate();
      
      // Create Redis adapter for clustering
      const redisAdapter = createAdapter(redisClient, subClient, {
        key: config.SOCKETIO.redis.keyPrefix,
      });
      
      io.adapter(redisAdapter);
      
      logger.info("✅ Socket.IO Redis adapter configured for clustering");
    } catch (error) {
      logger.error("❌ Failed to configure Socket.IO Redis adapter:", error);
      throw error;
    }
  }

  // Global error handler
  io.on("connection_error", (error) => {
    logger.error("Socket.IO connection error:", error);
  });

  logger.info("✅ Socket.IO server configured successfully");
  
  return io;
};

/**
 * Socket.IO server instance (singleton)
 */
let socketServer: SocketIOServer | null = null;

export const getSocketServer = (): SocketIOServer => {
  if (!socketServer) {
    throw new Error("Socket.IO server not initialized. Call createSocketServer first.");
  }
  return socketServer;
};

export const setSocketServer = (server: SocketIOServer): void => {
  socketServer = server;
};

/**
 * Gracefully shutdown Socket.IO server
 */
export const shutdownSocketServer = async (): Promise<void> => {
  if (socketServer) {
    logger.info("🛑 Shutting down Socket.IO server...");
    
    // Close all connections gracefully
    socketServer.close((error) => {
      if (error) {
        logger.error("Error during Socket.IO shutdown:", error);
      } else {
        logger.info("✅ Socket.IO server shut down successfully");
      }
    });
    
    socketServer = null;
  }
};