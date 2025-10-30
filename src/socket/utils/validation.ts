// src/socket/utils/validation.ts
import { z } from "zod";
import logger from "../../config/logger";
import { AuthenticatedSocket } from "../../@types/socket.types";

/**
 * Validation schemas for Socket.IO events
 */
export const socketValidationSchemas = {
  // Room events
  joinRoom: z.object({
    roomId: z.string().min(1).max(100),
    password: z.string().optional(),
  }),

  leaveRoom: z.object({
    roomId: z.string().min(1).max(100),
  }),

  // Message events
  sendMessage: z.object({
    roomId: z.string().min(1).max(100),
    content: z.string().min(1).max(5000),
    type: z.enum(["text", "image", "file"]).optional(),
    metadata: z.object({
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      replyTo: z.string().optional(),
    }).optional(),
  }),

  // User status events
  updateStatus: z.enum(["online", "away", "busy", "offline"]),

  // Typing events
  typing: z.object({
    roomId: z.string().min(1).max(100),
  }),
};

/**
 * Validates event data using Zod schemas
 */
export const validateEventData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  socket: AuthenticatedSocket,
  eventName: string
): T | null => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Socket ${socket.id}: Invalid data for event ${eventName}:`, {
        errors: error.issues,
        data,
        userId: socket.data.userId,
      });

      socket.emit("error", {
        code: "VALIDATION_ERROR",
        message: `Invalid data for ${eventName}`,
        timestamp: Date.now(),
        details: error.issues,
      });
    } else {
      logger.error(`Socket ${socket.id}: Validation error for event ${eventName}:`, error);
      
      socket.emit("error", {
        code: "VALIDATION_ERROR", 
        message: `Validation failed for ${eventName}`,
        timestamp: Date.now(),
      });
    }
    
    return null;
  }
};

/**
 * Creates a validation wrapper for event handlers
 */
export const withValidation = <T>(
  schema: z.ZodSchema<T>,
  handler: (socket: AuthenticatedSocket, data: T, ...args: any[]) => void | Promise<void>
) => {
  return async (socket: AuthenticatedSocket, data: unknown, ...args: any[]) => {
    const validatedData = validateEventData(
      schema, 
      data, 
      socket, 
      handler.name || "unknown"
    );
    
    if (validatedData !== null) {
      await handler(socket, validatedData, ...args);
    }
  };
};

/**
 * Validates user authentication
 */
export const requireAuth = (socket: AuthenticatedSocket, eventName: string): boolean => {
  if (!socket.data.isAuthenticated || !socket.data.userId) {
    logger.warn(`Socket ${socket.id}: Unauthorized access to ${eventName}`);
    
    socket.emit("error", {
      code: "UNAUTHORIZED",
      message: `Authentication required for ${eventName}`,
      timestamp: Date.now(),
    });
    
    return false;
  }
  
  return true;
};

/**
 * Creates an authentication wrapper for event handlers
 */
export const withAuth = (
  handler: (socket: AuthenticatedSocket, ...args: any[]) => void | Promise<void>
) => {
  return async (socket: AuthenticatedSocket, ...args: any[]) => {
    if (requireAuth(socket, handler.name || "unknown")) {
      await handler(socket, ...args);
    }
  };
};