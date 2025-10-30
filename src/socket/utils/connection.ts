// src/socket/utils/connection.ts
import { Server as SocketIOServer } from "socket.io";
import logger from "../../config/logger";
import { AuthenticatedSocket, ConnectionStats } from "../../@types/socket.types";
import { getSocketServer } from "../../config/socket";

/**
 * Connection management utilities for Socket.IO
 */

// Connection tracking
const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
const socketUsers = new Map<string, string>(); // socketId -> userId
const connectionStats = {
  totalConnections: 0,
  authenticatedConnections: 0,
  peakConnections: 0,
  startTime: Date.now(),
};

/**
 * Tracks a new socket connection
 */
export const trackConnection = (socket: AuthenticatedSocket): void => {
  connectionStats.totalConnections++;
  
  if (socket.data.isAuthenticated && socket.data.userId) {
    connectionStats.authenticatedConnections++;
    
    // Track user connections
    const userId = socket.data.userId;
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    
    connectedUsers.get(userId)!.add(socket.id);
    socketUsers.set(socket.id, userId);
    
    logger.info(`User ${userId} connected (${socket.id}). Total sockets for user: ${connectedUsers.get(userId)!.size}`);
  }
  
  // Update peak connections
  const currentConnections = getCurrentConnectionCount();
  if (currentConnections > connectionStats.peakConnections) {
    connectionStats.peakConnections = currentConnections;
  }
  
  logger.info(`Socket connected: ${socket.id}. Total connections: ${currentConnections}`);
};

/**
 * Tracks a socket disconnection
 */
export const trackDisconnection = (socket: AuthenticatedSocket, reason: string): void => {
  connectionStats.totalConnections--;
  
  const userId = socketUsers.get(socket.id);
  if (userId) {
    connectionStats.authenticatedConnections--;
    
    // Remove from user connections
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // Remove user if no more connections
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
        logger.info(`User ${userId} fully disconnected`);
        
        // Notify other users that this user went offline
        broadcastUserOffline(userId);
      } else {
        logger.info(`User ${userId} disconnected one socket (${socket.id}). Remaining sockets: ${userSockets.size}`);
      }
    }
    
    socketUsers.delete(socket.id);
  }
  
  logger.info(`Socket disconnected: ${socket.id} (${reason}). Total connections: ${getCurrentConnectionCount()}`);
};

/**
 * Gets current connection count
 */
export const getCurrentConnectionCount = (): number => {
  try {
    const io = getSocketServer();
    return io.engine.clientsCount;
  } catch {
    return connectionStats.totalConnections;
  }
};

/**
 * Gets connection statistics
 */
export const getConnectionStats = (): ConnectionStats => {
  const io = getSocketServer();
  const currentConnections = getCurrentConnectionCount();
  
  return {
    totalConnections: currentConnections,
    authenticatedConnections: connectionStats.authenticatedConnections,
    roomCount: io.sockets.adapter.rooms.size,
    totalRooms: io.sockets.adapter.rooms.size,
    messagesPerMinute: 0, // TODO: Implement message rate tracking
  };
};

/**
 * Gets all socket IDs for a user
 */
export const getUserSocketIds = (userId: string): string[] => {
  const userSockets = connectedUsers.get(userId);
  return userSockets ? Array.from(userSockets) : [];
};

/**
 * Checks if a user is online (has any connected sockets)
 */
export const isUserOnline = (userId: string): boolean => {
  const userSockets = connectedUsers.get(userId);
  return userSockets ? userSockets.size > 0 : false;
};

/**
 * Gets all online users
 */
export const getOnlineUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};

/**
 * Broadcasts to all sockets of a specific user
 */
export const broadcastToUser = (userId: string, event: string, data: any): boolean => {
  const socketIds = getUserSocketIds(userId);
  
  if (socketIds.length === 0) {
    return false;
  }
  
  try {
    const io = getSocketServer();
    
    socketIds.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
    
    logger.debug(`Broadcasted ${event} to user ${userId} (${socketIds.length} sockets)`);
    return true;
  } catch (error) {
    logger.error(`Error broadcasting to user ${userId}:`, error);
    return false;
  }
};

/**
 * Broadcasts to all connected sockets
 */
export const broadcastToAll = (event: string, data: any, excludeUserId?: string): void => {
  try {
    const io = getSocketServer();
    
    if (excludeUserId) {
      const excludeSocketIds = getUserSocketIds(excludeUserId);
      
      for (const [socketId, socket] of io.sockets.sockets) {
        if (!excludeSocketIds.includes(socketId)) {
          socket.emit(event, data);
        }
      }
    } else {
      io.emit(event, data);
    }
    
    logger.debug(`Broadcasted ${event} to all users`);
  } catch (error) {
    logger.error(`Error broadcasting to all users:`, error);
  }
};

/**
 * Broadcasts user online status
 */
export const broadcastUserOnline = (userId: string): void => {
  broadcastToAll("user_online", userId, userId);
};

/**
 * Broadcasts user offline status
 */
export const broadcastUserOffline = (userId: string): void => {
  broadcastToAll("user_offline", userId, userId);
};

/**
 * Disconnects all sockets for a user
 */
export const disconnectUser = (userId: string, reason: string = "Server disconnect"): void => {
  const socketIds = getUserSocketIds(userId);
  
  if (socketIds.length === 0) {
    return;
  }
  
  try {
    const io = getSocketServer();
    
    socketIds.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    });
    
    logger.info(`Disconnected user ${userId} (${socketIds.length} sockets): ${reason}`);
  } catch (error) {
    logger.error(`Error disconnecting user ${userId}:`, error);
  }
};

/**
 * Gets detailed connection information
 */
export const getConnectionDetails = () => {
  const uptimeMs = Date.now() - connectionStats.startTime;
  const uptimeMinutes = Math.floor(uptimeMs / 60000);
  
  return {
    ...getConnectionStats(),
    peakConnections: connectionStats.peakConnections,
    uptime: {
      ms: uptimeMs,
      minutes: uptimeMinutes,
      formatted: formatUptime(uptimeMs),
    },
    onlineUsers: getOnlineUsers(),
    userConnectionCounts: Array.from(connectedUsers.entries()).map(([userId, sockets]) => ({
      userId,
      socketCount: sockets.size,
    })),
  };
};

/**
 * Formats uptime in a human-readable way
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Cleanup disconnected sockets (call periodically)
 */
export const cleanupDisconnectedSockets = (): void => {
  try {
    const io = getSocketServer();
    const activeSockets = new Set(io.sockets.sockets.keys());
    
    // Clean up socketUsers map
    for (const [socketId, userId] of socketUsers.entries()) {
      if (!activeSockets.has(socketId)) {
        socketUsers.delete(socketId);
        
        // Remove from user connections
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socketId);
          if (userSockets.size === 0) {
            connectedUsers.delete(userId);
          }
        }
      }
    }
    
    logger.debug("Cleaned up disconnected socket references");
  } catch (error) {
    logger.error("Error during socket cleanup:", error);
  }
};