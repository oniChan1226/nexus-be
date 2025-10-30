// src/socket/handlers/message.handler.ts
import logger from "../../config/logger";
import { 
  AuthenticatedSocket, 
  MessagePayload, 
  SendMessageData,
  MessageResponse 
} from "../../@types/socket.types";
import { 
  socketValidationSchemas, 
  withValidation, 
  withAuth 
} from "../utils/validation";
import { 
  broadcastToRoom, 
  isUserInRoom 
} from "../utils/room";
import { createEventRateLimit } from "../middlewares/rateLimit.middleware";

// Create rate limiter for messages (max 30 messages per minute)
const messageRateLimit = createEventRateLimit(30, 60000);

/**
 * Message event handlers for Socket.IO
 */

/**
 * Handles sending messages to a room
 */
export const handleSendMessage = withAuth(
  async (
    socket: AuthenticatedSocket,
    data: unknown,
    callback: (response: MessageResponse) => void,
    next: (err?: Error) => void
  ) => {
    // Apply rate limiting
    messageRateLimit(socket, (rateLimitError) => {
      if (rateLimitError) {
        callback({
          success: false,
          error: "Rate limit exceeded. Please slow down.",
        });
        return;
      }

      // Validate message data
      const validatedData = socketValidationSchemas.sendMessage.safeParse(data);
      
      if (!validatedData.success) {
        callback({
          success: false,
          error: "Invalid message data",
        });
        return;
      }

      processSendMessage(socket, validatedData.data, callback);
    });
  }
);

/**
 * Process the actual message sending
 */
async function processSendMessage(
  socket: AuthenticatedSocket,
  data: SendMessageData,
  callback: (response: MessageResponse) => void
) {
  try {
    const { roomId, content, type = "text", metadata } = data;
    const userId = socket.data.userId!;
    const user = socket.data.user!;

    logger.info(`User ${userId} sending message to room ${roomId}`);

    // Check if user is in the room
    if (!isUserInRoom(userId, roomId)) {
      callback({
        success: false,
        error: "You are not a member of this room",
      });
      return;
    }

    // Validate message content
    if (!content || content.trim().length === 0) {
      callback({
        success: false,
        error: "Message content cannot be empty",
      });
      return;
    }

    if (content.length > 5000) {
      callback({
        success: false,
        error: "Message too long (max 5000 characters)",
      });
      return;
    }

    // Create message payload
    const message: MessagePayload = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      userId,
      username: user.name || user.email || "Unknown",
      content: content.trim(),
      timestamp: Date.now(),
      type,
      metadata,
    };

    // TODO: Save message to database
    // await MessageModel.create(message);

    // Broadcast message to room (excluding sender)
    broadcastToRoom(roomId, "room_message", message, socket.id);

    // Send confirmation to sender
    callback({
      success: true,
      message,
    });

    logger.info(`Message sent successfully in room ${roomId} by user ${userId}`);

  } catch (error) {
    logger.error(`Error in processSendMessage:`, error);
    
    callback({
      success: false,
      error: "Failed to send message",
    });
  }
}

/**
 * Handles typing start event
 */
export const handleTypingStart = withAuth(
  withValidation(
    socketValidationSchemas.typing,
    async (socket: AuthenticatedSocket, data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const userId = socket.data.userId!;
        const username = socket.data.user!.name || socket.data.user!.email || "Unknown";

        // Check if user is in the room
        if (!isUserInRoom(userId, roomId)) {
          return;
        }

        // Broadcast typing indicator to room (excluding sender)
        broadcastToRoom(roomId, "typing_start", {
          userId,
          username,
          roomId,
          timestamp: Date.now(),
        }, socket.id);

        logger.debug(`User ${userId} started typing in room ${roomId}`);

      } catch (error) {
        logger.error(`Error in handleTypingStart:`, error);
      }
    }
  )
);

/**
 * Handles typing stop event
 */
export const handleTypingStop = withAuth(
  withValidation(
    socketValidationSchemas.typing,
    async (socket: AuthenticatedSocket, data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const userId = socket.data.userId!;
        const username = socket.data.user!.name || socket.data.user!.email || "Unknown";

        // Check if user is in the room
        if (!isUserInRoom(userId, roomId)) {
          return;
        }

        // Broadcast typing stop to room (excluding sender)
        broadcastToRoom(roomId, "typing_stop", {
          userId,
          username,
          roomId,
          timestamp: Date.now(),
        }, socket.id);

        logger.debug(`User ${userId} stopped typing in room ${roomId}`);

      } catch (error) {
        logger.error(`Error in handleTypingStop:`, error);
      }
    }
  )
);

/**
 * Handles message history request
 */
export const handleGetMessageHistory = withAuth(async (
  socket: AuthenticatedSocket,
  data: { roomId: string; limit?: number; before?: number },
  callback: (response: { success: boolean; messages?: MessagePayload[]; error?: string }) => void
) => {
  try {
    const { roomId, limit = 50, before } = data;
    const userId = socket.data.userId!;

    // Check if user is in the room
    if (!isUserInRoom(userId, roomId)) {
      callback({
        success: false,
        error: "Access denied to this room",
      });
      return;
    }

    // TODO: Implement database query for message history
    // const messages = await MessageModel.find({
    //   roomId,
    //   timestamp: before ? { $lt: before } : undefined,
    // })
    // .sort({ timestamp: -1 })
    // .limit(limit)
    // .lean();

    // For now, return empty array
    const messages: MessagePayload[] = [];

    callback({
      success: true,
      messages: messages.reverse(), // Return in chronological order
    });

    logger.debug(`Retrieved ${messages.length} messages for room ${roomId}`);

  } catch (error) {
    logger.error(`Error in handleGetMessageHistory:`, error);
    
    callback({
      success: false,
      error: "Failed to retrieve message history",
    });
  }
});