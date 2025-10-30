// src/socket/SocketManager.ts
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import logger from "../config/logger";
import { createSocketServer, setSocketServer, shutdownSocketServer } from "../config/socket";
import { AuthenticatedSocket, SocketEvents } from "../@types/socket.types";
import { 
  socketAuthMiddleware, 
  socketOptionalAuthMiddleware,
  socketRateLimitMiddleware,
  socketLoggingMiddleware,
  socketPerformanceMiddleware
} from "./middlewares";
import {
  handleConnection,
  handleDisconnect,
  handleAuthentication,
  handlePing,
  handleJoinRoom,
  handleLeaveRoom,
  handleGetRoomInfo,
  handleListMyRooms,
  handleSendMessage,
  handleTypingStart,
  handleTypingStop,
  handleGetMessageHistory,
  handleUpdateStatus,
  handleGetOnlineUsers,
  handleGetUserProfile,
  handleUpdateProfile,
  handleGetServerStats,
  handleSearchUsers
} from "./handlers";
import { SocketService, NotificationService } from "./services";
import { cleanupDisconnectedSockets } from "./utils/connection";
import { cleanupInactiveRooms } from "./utils/room";

/**
 * Socket.IO Manager - Main class that orchestrates all Socket.IO functionality
 */
export class SocketManager {
  private io: SocketIOServer | null = null;
  private socketService: SocketService | null = null;
  private notificationService: NotificationService | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Initializes Socket.IO server with all configurations
   */
  async initialize(httpServer: HTTPServer): Promise<void> {
    try {
      logger.info("🔌 Initializing Socket.IO server...");

      // Create Socket.IO server
      this.io = await createSocketServer(httpServer);
      setSocketServer(this.io);

      // Initialize services
      this.socketService = new SocketService(this.io);
      this.notificationService = new NotificationService();

      // Set up middlewares
      this.setupMiddlewares();

      // Set up event handlers
      this.setupEventHandlers();

      // Start cleanup tasks
      this.startCleanupTasks();

      logger.info("✅ Socket.IO server initialized successfully");
    } catch (error) {
      logger.error("❌ Failed to initialize Socket.IO server:", error);
      throw error;
    }
  }

  /**
   * Sets up Socket.IO middlewares
   */
  private setupMiddlewares(): void {
    if (!this.io) {
      throw new Error("Socket.IO server not initialized");
    }

    // Apply middlewares in order
    this.io.use(socketLoggingMiddleware);
    this.io.use(socketPerformanceMiddleware);
    this.io.use(socketRateLimitMiddleware);
    
    // Use optional auth middleware (allows both authenticated and guest connections)
    this.io.use(socketOptionalAuthMiddleware);

    logger.info("✅ Socket.IO middlewares configured");
  }

  /**
   * Sets up Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) {
      throw new Error("Socket.IO server not initialized");
    }

    this.io.on(SocketEvents.CONNECTION, (socket: AuthenticatedSocket) => {
      // Handle initial connection
      handleConnection(socket);

      // Connection events
      socket.on(SocketEvents.AUTHENTICATE, (token, callback) => 
        handleAuthentication(socket, token, callback));

      socket.on(SocketEvents.PING, (callback) => 
        handlePing(socket, callback));

      // Room events
      socket.on(SocketEvents.JOIN_ROOM, (roomId, callback) => 
        handleJoinRoom(socket, roomId, callback));

      socket.on(SocketEvents.LEAVE_ROOM, (roomId, callback) => 
        handleLeaveRoom(socket, roomId, callback));

      // Message events
      socket.on(SocketEvents.SEND_MESSAGE, (data, callback) => 
        handleSendMessage(socket, data, callback, () => {}));

      socket.on(SocketEvents.TYPING_START, (roomId: string) => 
        handleTypingStart(socket, { roomId }));

      socket.on(SocketEvents.TYPING_STOP, (roomId: string) => 
        handleTypingStop(socket, { roomId }));

      // User events
      socket.on(SocketEvents.UPDATE_STATUS, (status) => 
        handleUpdateStatus(socket, status));

      // Additional events using any type for flexibility
      (socket as any).on("get_room_info", (roomId: string, callback: any) => 
        handleGetRoomInfo(socket, roomId, callback));

      (socket as any).on("list_my_rooms", (callback: any) => 
        handleListMyRooms(socket, callback));

      (socket as any).on("get_message_history", (data: any, callback: any) => 
        handleGetMessageHistory(socket, data, callback));

      (socket as any).on("get_online_users", (callback: any) => 
        handleGetOnlineUsers(socket, callback));

      (socket as any).on("get_user_profile", (userId: string, callback: any) => 
        handleGetUserProfile(socket, userId, callback));

      (socket as any).on("update_profile", (data: any, callback: any) => 
        handleUpdateProfile(socket, data, callback));

      (socket as any).on("get_server_stats", (callback: any) => 
        handleGetServerStats(socket, callback));

      (socket as any).on("search_users", (query: string, callback: any) => 
        handleSearchUsers(socket, query, callback));

      // Disconnect event
      socket.on(SocketEvents.DISCONNECT, (reason) => 
        handleDisconnect(socket, reason));
    });

    logger.info("✅ Socket.IO event handlers configured");
  }

  /**
   * Starts periodic cleanup tasks
   */
  private startCleanupTasks(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      try {
        cleanupDisconnectedSockets();
        cleanupInactiveRooms();
        logger.debug("🧹 Periodic cleanup completed");
      } catch (error) {
        logger.error("Error during cleanup:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    logger.info("✅ Cleanup tasks started");
  }

  /**
   * Gets the Socket.IO server instance
   */
  getServer(): SocketIOServer {
    if (!this.io) {
      throw new Error("Socket.IO server not initialized");
    }
    return this.io;
  }

  /**
   * Gets the Socket service
   */
  getSocketService(): SocketService {
    if (!this.socketService) {
      throw new Error("Socket service not initialized");
    }
    return this.socketService;
  }

  /**
   * Gets the Notification service
   */
  getNotificationService(): NotificationService {
    if (!this.notificationService) {
      throw new Error("Notification service not initialized");
    }
    return this.notificationService;
  }

  /**
   * Gracefully shuts down Socket.IO server
   */
  async shutdown(): Promise<void> {
    logger.info("🛑 Shutting down Socket.IO server...");

    try {
      // Stop cleanup tasks
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      // Shutdown services
      if (this.socketService) {
        await this.socketService.shutdown();
      }

      // Shutdown Socket.IO server
      await shutdownSocketServer();

      this.io = null;
      this.socketService = null;
      this.notificationService = null;

      logger.info("✅ Socket.IO server shut down successfully");
    } catch (error) {
      logger.error("❌ Error during Socket.IO shutdown:", error);
      throw error;
    }
  }

  /**
   * Broadcasts a message to all connected clients
   */
  broadcast(event: string, data: any): void {
    if (!this.io) {
      logger.warn("Cannot broadcast: Socket.IO server not initialized");
      return;
    }

    this.io.emit(event, data);
    logger.debug(`Broadcasted ${event} to all clients`);
  }

  /**
   * Gets server statistics
   */
  getStats() {
    if (!this.io) {
      return { error: "Socket.IO server not initialized" };
    }

    return {
      connectedSockets: this.io.sockets.sockets.size,
      totalRooms: this.io.sockets.adapter.rooms.size,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}

// Export singleton instance
export const socketManager = new SocketManager();