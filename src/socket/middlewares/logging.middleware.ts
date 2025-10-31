// src/socket/middlewares/logging.middleware.ts
import logger from "../../config/logger";
import { AuthenticatedSocket, SocketMiddleware } from "../../@types/socket.types";

/**
 * Socket.IO Logging Middleware
 * Logs connection events and user activities
 */
export const socketLoggingMiddleware: SocketMiddleware = (socket, next) => {
  const clientInfo = {
    socketId: socket.id,
    userId: socket.data.userId || "anonymous",
    userAgent: socket.handshake.headers["user-agent"],
    ip: socket.handshake.address,
    timestamp: new Date().toISOString(),
  };

  logger.info(`Socket connection attempt:`, clientInfo);

  // Log when socket disconnects
  socket.on("disconnect", (reason) => {
    const disconnectInfo = {
      ...clientInfo,
      reason,
      connectedDuration: socket.data.connectedAt 
        ? Date.now() - socket.data.connectedAt.getTime() 
        : 0,
      lastActivity: socket.data.lastActivity?.toISOString(),
    };

    logger.info(`Socket disconnected:`, disconnectInfo);
  });

  next();
};

/**
 * Middleware to log specific events
 */
export const createEventLoggingMiddleware = (eventName: string) => {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const eventInfo = {
      event: eventName,
      socketId: socket.id,
      userId: socket.data.userId || "anonymous",
      timestamp: new Date().toISOString(),
    };

    logger.debug(`Socket event: ${eventName}`, eventInfo);
    next();
  };
};

/**
 * Middleware to log errors
 */
export const socketErrorLoggingMiddleware = (
  socket: AuthenticatedSocket, 
  error: Error, 
  eventName?: string
) => {
  const errorInfo = {
    error: error.message,
    stack: error.stack,
    socketId: socket.id,
    userId: socket.data.userId || "anonymous",
    event: eventName,
    timestamp: new Date().toISOString(),
    userAgent: socket.handshake.headers["user-agent"],
    ip: socket.handshake.address,
  };

  logger.error(`Socket error:`, errorInfo);
};

/**
 * Performance monitoring middleware
 */
export const socketPerformanceMiddleware: SocketMiddleware = (socket, next) => {
  // Store connection start time
  socket.data.lastActivity = new Date();

  // Log connection performance metrics periodically
  const performanceInterval = setInterval(() => {
    const uptime = Date.now() - socket.data.connectedAt.getTime();
    const lastActivity = socket.data.lastActivity ? 
      Date.now() - socket.data.lastActivity.getTime() : 0;

    if (lastActivity > 300000) { // 5 minutes of inactivity
      logger.debug(`Socket inactive:`, {
        socketId: socket.id,
        userId: socket.data.userId || "anonymous",
        uptime: `${uptime}ms`,
        lastActivity: `${lastActivity}ms ago`,
      });
    }
  }, 60000); // Check every minute

  // Clear interval on disconnect
  socket.on("disconnect", () => {
    clearInterval(performanceInterval);
  });

  next();
};