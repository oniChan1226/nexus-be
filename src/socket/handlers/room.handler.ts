// src/socket/handlers/room.handler.ts
import logger from "../../config/logger";
import { 
  AuthenticatedSocket, 
  SocketEvents,
  JoinRoomResponse, 
  LeaveRoomResponse 
} from "../../@types/socket.types";
import { 
  joinRoom, 
  leaveRoom, 
  getRoomInfo, 
  getRoomMembers,
  isUserInRoom 
} from "../utils/room";
import { 
  socketValidationSchemas, 
  withValidation, 
  withAuth 
} from "../utils/validation";

/**
 * Room event handlers for Socket.IO
 */

/**
 * Handles joining a room
 */
export const handleJoinRoom = withAuth(
  withValidation(
    socketValidationSchemas.joinRoom,
    async (
      socket: AuthenticatedSocket,
      data: { roomId: string; password?: string },
      callback: (response: JoinRoomResponse) => void
    ) => {
      try {
        const { roomId, password } = data;
        const userId = socket.data.userId!;

        logger.info(`User ${userId} attempting to join room: ${roomId}`);

        // Check if user is already in the room
        if (isUserInRoom(userId, roomId)) {
          callback({
            success: false,
            error: "Already in this room",
          });
          return;
        }

        // TODO: Add room password validation if needed
        // TODO: Add room capacity limits
        // TODO: Add permission checks for private rooms

        const success = await joinRoom(socket, roomId);

        if (success) {
          const roomInfo = getRoomInfo(roomId);
          const members = getRoomMembers(roomId);

          callback({
            success: true,
            roomId,
          });

          // Send room info via notification
          socket.emit("notification", {
            id: `room_info_${roomId}_${Date.now()}`,
            type: "info" as const,
            title: "Room Joined",
            message: `Successfully joined room: ${roomInfo?.name || roomId}`,
            timestamp: Date.now(),
            data: {
              room: roomInfo,
              members: members.map(m => ({
                userId: m.userId,
                joinedAt: m.joinedAt,
                role: m.role,
              })),
            },
          });

          logger.info(`User ${userId} successfully joined room ${roomId}`);
        } else {
          callback({
            success: false,
            error: "Failed to join room",
          });
          
          logger.warn(`User ${userId} failed to join room ${roomId}`);
        }
      } catch (error) {
        logger.error(`Error in handleJoinRoom:`, error);
        
        callback({
          success: false,
          error: "Internal server error",
        });
      }
    }
  )
);

/**
 * Handles leaving a room
 */
export const handleLeaveRoom = withAuth(
  withValidation(
    socketValidationSchemas.leaveRoom,
    async (
      socket: AuthenticatedSocket,
      data: { roomId: string },
      callback: (response: LeaveRoomResponse) => void
    ) => {
      try {
        const { roomId } = data;
        const userId = socket.data.userId!;

        logger.info(`User ${userId} attempting to leave room: ${roomId}`);

        // Check if user is in the room
        if (!isUserInRoom(userId, roomId)) {
          callback({
            success: false,
            error: "Not in this room",
          });
          return;
        }

        const success = await leaveRoom(socket, roomId);

        if (success) {
          callback({
            success: true,
            roomId,
          });

          logger.info(`User ${userId} successfully left room ${roomId}`);
        } else {
          callback({
            success: false,
            error: "Failed to leave room",
          });
          
          logger.warn(`User ${userId} failed to leave room ${roomId}`);
        }
      } catch (error) {
        logger.error(`Error in handleLeaveRoom:`, error);
        
        callback({
          success: false,
          error: "Internal server error",
        });
      }
    }
  )
);

/**
 * Handles getting room information
 */
export const handleGetRoomInfo = withAuth(async (
  socket: AuthenticatedSocket,
  roomId: string,
  callback: (response: { success: boolean; room?: any; members?: any[]; error?: string }) => void
) => {
  try {
    const userId = socket.data.userId!;

    // Check if user has access to this room
    if (!isUserInRoom(userId, roomId)) {
      callback({
        success: false,
        error: "Access denied to this room",
      });
      return;
    }

    const roomInfo = getRoomInfo(roomId);
    const members = getRoomMembers(roomId);

    if (roomInfo) {
      callback({
        success: true,
        room: roomInfo,
        members: members.map(m => ({
          userId: m.userId,
          joinedAt: m.joinedAt,
          role: m.role,
        })),
      });
    } else {
      callback({
        success: false,
        error: "Room not found",
      });
    }
  } catch (error) {
    logger.error(`Error in handleGetRoomInfo:`, error);
    
    callback({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Handles listing user's rooms
 */
export const handleListMyRooms = withAuth(async (
  socket: AuthenticatedSocket,
  callback: (response: { success: boolean; rooms?: any[]; error?: string }) => void
) => {
  try {
    const userId = socket.data.userId!;
    const userRooms = Array.from(socket.data.rooms);
    
    const roomDetails = userRooms.map(roomId => {
      const roomInfo = getRoomInfo(roomId);
      const members = getRoomMembers(roomId);
      
      return {
        ...roomInfo,
        memberCount: members.length,
      };
    }).filter(Boolean);

    callback({
      success: true,
      rooms: roomDetails,
    });

    logger.debug(`Listed ${roomDetails.length} rooms for user ${userId}`);
  } catch (error) {
    logger.error(`Error in handleListMyRooms:`, error);
    
    callback({
      success: false,
      error: "Internal server error",
    });
  }
});