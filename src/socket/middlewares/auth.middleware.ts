// src/socket/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import logger from "../../config/logger";
import { UserModel } from "../../models/user.model";
import { AuthenticatedSocket, SocketMiddleware } from "../../@types/socket.types";

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token and attaches user to socket
 */
export const socketAuthMiddleware: SocketMiddleware = async (socket, next) => {
  try {
    // Extract token from auth header or query params
    const token = 
      socket.handshake.auth?.token || 
      socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
      socket.handshake.query?.token as string;

    if (!token) {
      logger.warn(`Socket ${socket.id}: No authentication token provided`);
      return next(new Error("Authentication token required"));
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT.accessToken.secret);
    } catch (jwtError) {
      logger.warn(`Socket ${socket.id}: Invalid JWT token`);
      return next(new Error("Invalid authentication token"));
    }

    if (!decoded.userId) {
      logger.warn(`Socket ${socket.id}: JWT token missing userId`);
      return next(new Error("Invalid token payload"));
    }

    // Fetch user from database
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      logger.warn(`Socket ${socket.id}: User not found for userId ${decoded.userId}`);
      return next(new Error("User not found"));
    }

    // Attach user data to socket
    socket.data.userId = user._id.toString();
    socket.data.user = user.toObject();
    socket.data.isAuthenticated = true;
    socket.data.connectedAt = new Date();
    socket.data.lastActivity = new Date();
    socket.data.rooms = new Set();
    socket.data.rateLimitCount = 0;
    socket.data.rateLimitReset = Date.now() + config.SOCKETIO.rateLimit.windowMs;

    logger.info(`Socket ${socket.id}: Authenticated user ${user._id} (${user.email})`);
    next();
  } catch (error) {
    logger.error(`Socket ${socket.id}: Authentication error:`, error);
    next(new Error("Authentication failed"));
  }
};

/**
 * Optional authentication middleware - allows unauthenticated connections
 * but still attempts to authenticate if token is provided
 */
export const socketOptionalAuthMiddleware: SocketMiddleware = async (socket, next) => {
  try {
    // Extract token from auth header or query params
    const token = 
      socket.handshake.auth?.token || 
      socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
      socket.handshake.query?.token as string;

    // Initialize socket data
    socket.data.isAuthenticated = false;
    socket.data.connectedAt = new Date();
    socket.data.lastActivity = new Date();
    socket.data.rooms = new Set();
    socket.data.rateLimitCount = 0;
    socket.data.rateLimitReset = Date.now() + config.SOCKETIO.rateLimit.windowMs;

    if (!token) {
      logger.info(`Socket ${socket.id}: Connected without authentication`);
      return next();
    }

    // Try to authenticate if token is provided
    try {
      const decoded: any = jwt.verify(token, config.JWT.accessToken.secret);
      
      if (decoded.userId) {
        const user = await UserModel.findById(decoded.userId).select("-password");
        
        if (user) {
          socket.data.userId = user._id.toString();
          socket.data.user = user.toObject();
          socket.data.isAuthenticated = true;
          
          logger.info(`Socket ${socket.id}: Optionally authenticated user ${user._id} (${user.email})`);
        }
      }
    } catch (jwtError) {
      logger.warn(`Socket ${socket.id}: Optional authentication failed, continuing as guest`);
    }

    next();
  } catch (error) {
    logger.error(`Socket ${socket.id}: Optional authentication middleware error:`, error);
    // Continue anyway for optional auth
    socket.data.isAuthenticated = false;
    next();
  }
};