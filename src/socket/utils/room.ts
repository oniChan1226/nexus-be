// src/socket/utils/room.ts
import { Server as SocketIOServer } from "socket.io";
import logger from "../../config/logger";
import { AuthenticatedSocket, RoomInfo, RoomMember } from "../../@types/socket.types";
import { getSocketServer } from "../../config/socket";

/**
 * Room management utilities for Socket.IO
 */

// In-memory storage for room information (consider Redis for production)
const rooms = new Map<string, RoomInfo>();
const roomMembers = new Map<string, Set<RoomMember>>();

/**
 * Creates a new room
 */
export const createRoom = (
  roomId: string, 
  name: string, 
  type: "public" | "private" | "direct" = "public",
  metadata?: any
): RoomInfo => {
  const roomInfo: RoomInfo = {
    id: roomId,
    name,
    type,
    memberCount: 0,
    createdAt: new Date(),
    metadata,
  };

  rooms.set(roomId, roomInfo);
  roomMembers.set(roomId, new Set());

  logger.info(`Room created: ${roomId} (${name})`);
  return roomInfo;
};

/**
 * Joins a user to a room
 */
export const joinRoom = async (
  socket: AuthenticatedSocket,
  roomId: string
): Promise<boolean> => {
  try {
    // Check if room exists, create if it doesn't
    if (!rooms.has(roomId)) {
      createRoom(roomId, `Room ${roomId}`);
    }

    // Join the Socket.IO room
    await socket.join(roomId);

    // Add to our room tracking
    const members = roomMembers.get(roomId);
    if (members) {
      const member: RoomMember = {
        userId: socket.data.userId!,
        socketId: socket.id,
        joinedAt: new Date(),
        role: "member",
      };

      members.add(member);
      socket.data.rooms.add(roomId);

      // Update room info
      const roomInfo = rooms.get(roomId)!;
      roomInfo.memberCount = members.size;

      logger.info(`User ${socket.data.userId} joined room ${roomId}`);

      // Notify other room members
      socket.to(roomId).emit("room_joined", {
        roomId,
        userId: socket.data.userId!,
      });

      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error joining room ${roomId}:`, error);
    return false;
  }
};

/**
 * Removes a user from a room
 */
export const leaveRoom = async (
  socket: AuthenticatedSocket,
  roomId: string
): Promise<boolean> => {
  try {
    // Leave the Socket.IO room
    await socket.leave(roomId);

    // Remove from our room tracking
    const members = roomMembers.get(roomId);
    if (members) {
      // Find and remove the member
      for (const member of members) {
        if (member.socketId === socket.id) {
          members.delete(member);
          break;
        }
      }

      socket.data.rooms.delete(roomId);

      // Update room info
      const roomInfo = rooms.get(roomId);
      if (roomInfo) {
        roomInfo.memberCount = members.size;

        // Delete empty rooms (except system rooms)
        if (members.size === 0 && !roomId.startsWith("system_")) {
          rooms.delete(roomId);
          roomMembers.delete(roomId);
          logger.info(`Empty room deleted: ${roomId}`);
        }
      }

      logger.info(`User ${socket.data.userId} left room ${roomId}`);

      // Notify other room members
      socket.to(roomId).emit("room_left", {
        roomId,
        userId: socket.data.userId!,
      });

      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error leaving room ${roomId}:`, error);
    return false;
  }
};

/**
 * Removes a user from all rooms (used on disconnect)
 */
export const leaveAllRooms = async (socket: AuthenticatedSocket): Promise<void> => {
  const userRooms = Array.from(socket.data.rooms);
  
  for (const roomId of userRooms) {
    await leaveRoom(socket, roomId);
  }
};

/**
 * Gets room information
 */
export const getRoomInfo = (roomId: string): RoomInfo | null => {
  return rooms.get(roomId) || null;
};

/**
 * Gets room members
 */
export const getRoomMembers = (roomId: string): RoomMember[] => {
  const members = roomMembers.get(roomId);
  return members ? Array.from(members) : [];
};

/**
 * Gets all rooms a user is in
 */
export const getUserRooms = (userId: string): string[] => {
  const userRooms: string[] = [];

  for (const [roomId, members] of roomMembers.entries()) {
    for (const member of members) {
      if (member.userId === userId) {
        userRooms.push(roomId);
        break;
      }
    }
  }

  return userRooms;
};

/**
 * Broadcasts a message to a room
 */
export const broadcastToRoom = (
  roomId: string,
  event: string,
  data: any,
  excludeSocketId?: string
): void => {
  try {
    const io = getSocketServer();
    
    if (excludeSocketId) {
      io.to(roomId).except(excludeSocketId).emit(event, data);
    } else {
      io.to(roomId).emit(event, data);
    }

    logger.debug(`Broadcasted ${event} to room ${roomId}`);
  } catch (error) {
    logger.error(`Error broadcasting to room ${roomId}:`, error);
  }
};

/**
 * Checks if a user is in a room
 */
export const isUserInRoom = (userId: string, roomId: string): boolean => {
  const members = roomMembers.get(roomId);
  if (!members) return false;

  for (const member of members) {
    if (member.userId === userId) {
      return true;
    }
  }

  return false;
};

/**
 * Gets room statistics
 */
export const getRoomStats = () => {
  return {
    totalRooms: rooms.size,
    totalMembers: Array.from(roomMembers.values()).reduce(
      (total, members) => total + members.size, 
      0
    ),
    rooms: Array.from(rooms.values()),
  };
};

/**
 * Cleanup inactive rooms (call periodically)
 */
export const cleanupInactiveRooms = (): void => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [roomId, roomInfo] of rooms.entries()) {
    const age = now - roomInfo.createdAt.getTime();
    const members = roomMembers.get(roomId);

    // Delete rooms that are old and empty
    if (age > maxAge && (!members || members.size === 0)) {
      rooms.delete(roomId);
      roomMembers.delete(roomId);
      logger.info(`Cleaned up inactive room: ${roomId}`);
    }
  }
};