// src/socket/handlers/user.handler.ts
import logger from "../../config/logger";
import { 
  AuthenticatedSocket, 
  UserStatus 
} from "../../@types/socket.types";
import { 
  socketValidationSchemas, 
  withValidation, 
  withAuth 
} from "../utils/validation";
import { 
  broadcastToAll, 
  getOnlineUsers,
  getConnectionDetails 
} from "../utils/connection";

/**
 * User event handlers for Socket.IO
 */

/**
 * Handles user status updates
 */
export const handleUpdateStatus = withAuth(async (
  socket: AuthenticatedSocket,
  status: string
) => {
  // Validate status manually
  if (!["online", "away", "busy", "offline"].includes(status)) {
    socket.emit("error", {
      code: "VALIDATION_ERROR",
      message: "Invalid status value",
      timestamp: Date.now(),
    });
    return;
  }
  try {
    const userId = socket.data.userId!;

    logger.info(`User ${userId} updating status to ${status}`);

        // TODO: Update user status in database
        // await UserModel.findByIdAndUpdate(userId, { status });

        // Broadcast status update to all users (excluding the user themselves)
        broadcastToAll("user_updated", {
          userId,
          status,
          timestamp: Date.now(),
        }, userId);

    logger.info(`User ${userId} status updated to ${status}`);

  } catch (error) {
    logger.error(`Error in handleUpdateStatus:`, error);
    
    socket.emit("error", {
      code: "STATUS_UPDATE_ERROR",
      message: "Failed to update status",
      timestamp: Date.now(),
    });
  }
});

/**
 * Handles getting online users list
 */
export const handleGetOnlineUsers = withAuth(async (
  socket: AuthenticatedSocket,
  callback: (response: { success: boolean; users?: any[]; error?: string }) => void
) => {
  try {
    const onlineUserIds = getOnlineUsers();
    
    // TODO: Fetch user details from database
    // const users = await UserModel.find({ _id: { $in: onlineUserIds } })
    //   .select('name email status avatar')
    //   .lean();

    // For now, return basic user info
    const users = onlineUserIds.map(userId => ({
      id: userId,
      status: "online",
    }));

    callback({
      success: true,
      users,
    });

    logger.debug(`Returned ${users.length} online users to user ${socket.data.userId}`);

  } catch (error) {
    logger.error(`Error in handleGetOnlineUsers:`, error);
    
    callback({
      success: false,
      error: "Failed to get online users",
    });
  }
});

/**
 * Handles getting user profile
 */
export const handleGetUserProfile = withAuth(async (
  socket: AuthenticatedSocket,
  userId: string,
  callback: (response: { success: boolean; user?: any; error?: string }) => void
) => {
  try {
    // Check if requesting own profile or if user is online
    if (userId !== socket.data.userId && !getOnlineUsers().includes(userId)) {
      callback({
        success: false,
        error: "User not found or offline",
      });
      return;
    }

    // TODO: Fetch user profile from database
    // const user = await UserModel.findById(userId)
    //   .select('name email status avatar bio createdAt')
    //   .lean();

    // For now, return basic info
    const user = {
      id: userId,
      name: userId === socket.data.userId ? socket.data.user?.name : "Unknown",
      status: "online",
    };

    callback({
      success: true,
      user,
    });

    logger.debug(`User ${socket.data.userId} requested profile for ${userId}`);

  } catch (error) {
    logger.error(`Error in handleGetUserProfile:`, error);
    
    callback({
      success: false,
      error: "Failed to get user profile",
    });
  }
});

/**
 * Handles updating user profile
 */
export const handleUpdateProfile = withAuth(async (
  socket: AuthenticatedSocket,
  data: { name?: string; bio?: string; avatar?: string },
  callback: (response: { success: boolean; user?: any; error?: string }) => void
) => {
  try {
    const userId = socket.data.userId!;
    const { name, bio, avatar } = data;

    // Validate input data
    if (name && (name.length < 1 || name.length > 50)) {
      callback({
        success: false,
        error: "Name must be between 1 and 50 characters",
      });
      return;
    }

    if (bio && bio.length > 500) {
      callback({
        success: false,
        error: "Bio must be less than 500 characters",
      });
      return;
    }

    // TODO: Update user profile in database
    // const updatedUser = await UserModel.findByIdAndUpdate(
    //   userId,
    //   { name, bio, avatar },
    //   { new: true }
    // ).select('name email status bio avatar');

    // Update socket data
    if (socket.data.user) {
      if (name) socket.data.user.name = name;
      // Add bio and avatar to user type if needed
    }

    const updatedUser = {
      id: userId,
      name: name || socket.data.user?.name,
      bio,
      avatar,
    };

    callback({
      success: true,
      user: updatedUser,
    });

    // Broadcast user update to others
    broadcastToAll("user_updated", {
      userId,
      name: updatedUser.name,
      timestamp: Date.now(),
    }, userId);

    logger.info(`User ${userId} updated their profile`);

  } catch (error) {
    logger.error(`Error in handleUpdateProfile:`, error);
    
    callback({
      success: false,
      error: "Failed to update profile",
    });
  }
});

/**
 * Handles getting server statistics (admin only)
 */
export const handleGetServerStats = withAuth(async (
  socket: AuthenticatedSocket,
  callback: (response: { success: boolean; stats?: any; error?: string }) => void
) => {
  try {
    // TODO: Check if user has admin permissions
    // const user = await UserModel.findById(socket.data.userId);
    // if (!user || user.role !== 'admin') {
    //   callback({
    //     success: false,
    //     error: "Insufficient permissions",
    //   });
    //   return;
    // }

    const stats = getConnectionDetails();

    callback({
      success: true,
      stats,
    });

    logger.info(`User ${socket.data.userId} requested server stats`);

  } catch (error) {
    logger.error(`Error in handleGetServerStats:`, error);
    
    callback({
      success: false,
      error: "Failed to get server stats",
    });
  }
});

/**
 * Handles user search
 */
export const handleSearchUsers = withAuth(async (
  socket: AuthenticatedSocket,
  query: string,
  callback: (response: { success: boolean; users?: any[]; error?: string }) => void
) => {
  try {
    if (!query || query.trim().length < 2) {
      callback({
        success: false,
        error: "Search query must be at least 2 characters",
      });
      return;
    }

    // TODO: Implement user search in database
    // const users = await UserModel.find({
    //   $or: [
    //     { name: { $regex: query, $options: 'i' } },
    //     { email: { $regex: query, $options: 'i' } }
    //   ]
    // })
    // .select('name email status avatar')
    // .limit(20)
    // .lean();

    // For now, return empty results
    const users: any[] = [];

    callback({
      success: true,
      users,
    });

    logger.debug(`User ${socket.data.userId} searched for: ${query}`);

  } catch (error) {
    logger.error(`Error in handleSearchUsers:`, error);
    
    callback({
      success: false,
      error: "Search failed",
    });
  }
});