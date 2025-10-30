// src/socket/handlers/connection.handler.ts
import logger from "../../config/logger";
import { AuthenticatedSocket, SocketEvents } from "../../@types/socket.types";
import { trackConnection, trackDisconnection, broadcastUserOnline } from "../utils/connection";
import { leaveAllRooms } from "../utils/room";
import { socketErrorLoggingMiddleware } from "../middlewares/logging.middleware";

/**
 * Connection event handlers for Socket.IO
 */

/**
 * Handles new socket connections
 */
export const handleConnection = (socket: AuthenticatedSocket) => {
  // Track the connection
  trackConnection(socket);

  // Log connection details
  logger.info(`Socket connected: ${socket.id}`, {
    userId: socket.data.userId || "anonymous",
    isAuthenticated: socket.data.isAuthenticated,
    userAgent: socket.handshake.headers["user-agent"],
    ip: socket.handshake.address,
  });

  // Send welcome message
  socket.emit("connected", {
    message: "Connected to server successfully",
    timestamp: Date.now(),
  });

  // If user is authenticated, broadcast they're online
  if (socket.data.isAuthenticated && socket.data.userId) {
    broadcastUserOnline(socket.data.userId);
  }

  // Set up error handling
  socket.on("error", (error) => {
    socketErrorLoggingMiddleware(socket, error, "connection");
  });
};

/**
 * Handles socket disconnections
 */
export const handleDisconnect = async (socket: AuthenticatedSocket, reason: string) => {
  logger.info(`Socket disconnecting: ${socket.id}`, {
    userId: socket.data.userId || "anonymous",
    reason,
    connectedAt: socket.data.connectedAt,
    lastActivity: socket.data.lastActivity,
  });

  try {
    // Leave all rooms
    if (socket.data.rooms && socket.data.rooms.size > 0) {
      await leaveAllRooms(socket);
    }

    // Track disconnection (this handles user offline broadcasting)
    trackDisconnection(socket, reason);

  } catch (error) {
    logger.error(`Error during disconnect cleanup for socket ${socket.id}:`, error);
  }
};

/**
 * Handles connection errors
 */
export const handleConnectionError = (error: Error) => {
  logger.error("Socket.IO connection error:", {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handles authentication event
 */
export const handleAuthentication = async (
  socket: AuthenticatedSocket,
  token: string,
  callback: (response: { success: boolean; user?: any; error?: string }) => void
) => {
  try {
    // Authentication logic would go here
    // For now, we'll assume the middleware handled authentication
    
    if (socket.data.isAuthenticated && socket.data.user) {
      callback({
        success: true,
        user: {
          id: socket.data.userId,
          name: socket.data.user.name,
          email: socket.data.user.email,
        },
      });

      // Broadcast user online status
      if (socket.data.userId) {
        broadcastUserOnline(socket.data.userId);
      }

      logger.info(`Socket ${socket.id} authenticated successfully for user ${socket.data.userId}`);
    } else {
      callback({
        success: false,
        error: "Authentication failed",
      });

      logger.warn(`Socket ${socket.id} authentication failed`);
    }
  } catch (error) {
    logger.error(`Authentication error for socket ${socket.id}:`, error);
    
    callback({
      success: false,
      error: "Authentication error",
    });
  }
};

/**
 * Handles ping event
 */
export const handlePing = (
  socket: AuthenticatedSocket,
  callback: (response: { pong: boolean; timestamp: number }) => void
) => {
  socket.data.lastActivity = new Date();
  
  callback({
    pong: true,
    timestamp: Date.now(),
  });

  logger.debug(`Ping from socket ${socket.id}`);
};