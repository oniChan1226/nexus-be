// src/socket/services/SocketService.ts
import { Server as SocketIOServer } from "socket.io";
import logger from "../../config/logger";
import { 
  AuthenticatedSocket, 
  MessagePayload, 
  NotificationPayload,
  UserStatus 
} from "../../@types/socket.types";
import { 
  broadcastToUser, 
  broadcastToAll, 
  isUserOnline,
  getOnlineUsers 
} from "../utils/connection";
import { 
  broadcastToRoom, 
  getRoomInfo, 
  getRoomMembers,
  isUserInRoom 
} from "../utils/room";

/**
 * Socket.IO Service Layer
 * Provides high-level methods for Socket.IO operations
 */
export class SocketService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Sends a message to a specific user
   */
  async sendMessageToUser(
    userId: string, 
    message: string, 
    type: "info" | "success" | "warning" | "error" = "info"
  ): Promise<boolean> {
    if (!isUserOnline(userId)) {
      logger.warn(`Attempted to send message to offline user: ${userId}`);
      return false;
    }

    const notification: NotificationPayload = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: "Message",
      message,
      timestamp: Date.now(),
      userId,
    };

    return broadcastToUser(userId, "notification", notification);
  }

  /**
   * Sends a notification to a specific user
   */
  async sendNotificationToUser(
    userId: string, 
    notification: Omit<NotificationPayload, "timestamp">
  ): Promise<boolean> {
    if (!isUserOnline(userId)) {
      logger.warn(`Attempted to send notification to offline user: ${userId}`);
      return false;
    }

    const fullNotification: NotificationPayload = {
      ...notification,
      timestamp: Date.now(),
    };

    return broadcastToUser(userId, "notification", fullNotification);
  }

  /**
   * Broadcasts a message to all users in a room
   */
  async sendMessageToRoom(
    roomId: string,
    message: MessagePayload,
    excludeUserId?: string
  ): Promise<void> {
    const roomInfo = getRoomInfo(roomId);
    
    if (!roomInfo) {
      logger.warn(`Attempted to send message to non-existent room: ${roomId}`);
      return;
    }

    // Validate that the sender is in the room (if excludeUserId is provided)
    if (excludeUserId && !isUserInRoom(excludeUserId, roomId)) {
      logger.warn(`User ${excludeUserId} attempted to send message to room ${roomId} they're not in`);
      return;
    }

    broadcastToRoom(roomId, "room_message", message);
    logger.info(`Message sent to room ${roomId} by user ${message.userId}`);
  }

  /**
   * Updates user status and notifies others
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    if (!isUserOnline(userId)) {
      logger.warn(`Attempted to update status for offline user: ${userId}`);
      return;
    }

    // Update user status in all their sockets
    broadcastToUser(userId, "user_updated", { status });

    // Notify other users about the status change
    broadcastToAll("user_updated", { 
      userId, 
      status 
    }, userId);

    logger.info(`User ${userId} status updated to ${status}`);
  }

  /**
   * Kicks a user from a room
   */
  async kickUserFromRoom(
    roomId: string, 
    userId: string, 
    reason: string = "Kicked from room"
  ): Promise<boolean> {
    const roomMembers = getRoomMembers(roomId);
    const userInRoom = roomMembers.find(member => member.userId === userId);

    if (!userInRoom) {
      logger.warn(`Attempted to kick user ${userId} from room ${roomId} they're not in`);
      return false;
    }

    // Disconnect the user's socket from the room
    const userSocket = this.io.sockets.sockets.get(userInRoom.socketId);
    if (userSocket) {
      await userSocket.leave(roomId);
      
      userSocket.emit("error", {
        code: "KICKED_FROM_ROOM",
        message: reason,
        timestamp: Date.now(),
        details: { roomId, reason },
      });
    }

    // Notify room members
    broadcastToRoom(roomId, "room_left", {
      roomId,
      userId,
    });

    logger.info(`User ${userId} kicked from room ${roomId}: ${reason}`);
    return true;
  }

  /**
   * Bans a user from the entire socket server
   */
  async banUser(userId: string, reason: string = "Banned"): Promise<void> {
    // Disconnect all user's sockets
    const userSockets = this.io.sockets.sockets;
    
    for (const [socketId, socket] of userSockets) {
      const authenticatedSocket = socket as AuthenticatedSocket;
      
      if (authenticatedSocket.data.userId === userId) {
        authenticatedSocket.emit("error", {
          code: "USER_BANNED",
          message: reason,
          timestamp: Date.now(),
        });

        authenticatedSocket.disconnect(true);
      }
    }

    logger.info(`User ${userId} banned: ${reason}`);
  }

  /**
   * Broadcasts system announcement to all users
   */
  async broadcastAnnouncement(
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    const announcement: NotificationPayload = {
      id: `announcement_${Date.now()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
    };

    broadcastToAll("notification", announcement);
    logger.info(`System announcement broadcasted: ${title}`);
  }

  /**
   * Gets server statistics
   */
  getServerStats() {
    return {
      connectedSockets: this.io.sockets.sockets.size,
      onlineUsers: getOnlineUsers().length,
      totalRooms: this.io.sockets.adapter.rooms.size,
      serverUptime: process.uptime(),
    };
  }

  /**
   * Sends typing indicator to room
   */
  async sendTypingIndicator(
    userId: string, 
    roomId: string, 
    isTyping: boolean
  ): Promise<void> {
    if (!isUserInRoom(userId, roomId)) {
      return;
    }

    const event = isTyping ? "typing_start" : "typing_stop";
    
    broadcastToRoom(roomId, event, {
      userId,
      roomId,
      timestamp: Date.now(),
    });
  }

  /**
   * Creates a direct message room between two users
   */
  async createDirectMessageRoom(userId1: string, userId2: string): Promise<string> {
    // Create a deterministic room ID for DM
    const roomId = `dm_${[userId1, userId2].sort().join("_")}`;
    
    // Check if both users are online
    if (!isUserOnline(userId1) || !isUserOnline(userId2)) {
      throw new Error("Both users must be online to create DM room");
    }

    logger.info(`Created DM room ${roomId} for users ${userId1} and ${userId2}`);
    return roomId;
  }

  /**
   * Gracefully shuts down the socket service
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down Socket.IO service...");
    
    // Notify all connected users
    broadcastToAll("notification", {
      id: `shutdown_${Date.now()}`,
      type: "warning",
      title: "Server Maintenance",
      message: "Server is shutting down for maintenance. Please reconnect in a few minutes.",
      timestamp: Date.now(),
    });

    // Wait a bit for the message to be delivered
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Disconnect all sockets
    this.io.disconnectSockets(true);

    logger.info("Socket.IO service shutdown complete");
  }
}