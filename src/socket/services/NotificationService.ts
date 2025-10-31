// src/socket/services/NotificationService.ts
import logger from "../../config/logger";
import { NotificationPayload } from "../../@types/socket.types";
import { broadcastToUser, broadcastToAll, isUserOnline } from "../utils/connection";
import { broadcastToRoom, isUserInRoom } from "../utils/room";

/**
 * Notification Service for Socket.IO
 * Handles different types of notifications and delivery methods
 */
export class NotificationService {
  
  /**
   * Sends a notification to a specific user
   */
  async sendToUser(userId: string, notification: Omit<NotificationPayload, "timestamp">): Promise<boolean> {
    if (!isUserOnline(userId)) {
      logger.warn(`Cannot send notification to offline user: ${userId}`);
      return false;
    }

    const fullNotification: NotificationPayload = {
      ...notification,
      timestamp: Date.now(),
      userId,
    };

    const success = broadcastToUser(userId, "notification", fullNotification);
    
    if (success) {
      logger.info(`Notification sent to user ${userId}: ${notification.title}`);
    }
    
    return success;
  }

  /**
   * Sends notification to all users in a room
   */
  async sendToRoom(roomId: string, notification: Omit<NotificationPayload, "timestamp">): Promise<void> {
    const fullNotification: NotificationPayload = {
      ...notification,
      timestamp: Date.now(),
    };

    broadcastToRoom(roomId, "notification", fullNotification);
    logger.info(`Notification sent to room ${roomId}: ${notification.title}`);
  }

  /**
   * Sends notification to all connected users
   */
  async sendToAll(notification: Omit<NotificationPayload, "timestamp">): Promise<void> {
    const fullNotification: NotificationPayload = {
      ...notification,
      timestamp: Date.now(),
    };

    broadcastToAll("notification", fullNotification);
    logger.info(`Global notification sent: ${notification.title}`);
  }

  /**
   * Sends notification to multiple specific users
   */
  async sendToUsers(userIds: string[], notification: Omit<NotificationPayload, "timestamp">): Promise<number> {
    let successCount = 0;

    for (const userId of userIds) {
      const success = await this.sendToUser(userId, notification);
      if (success) {
        successCount++;
      }
    }

    logger.info(`Notification sent to ${successCount}/${userIds.length} users: ${notification.title}`);
    return successCount;
  }

  /**
   * Sends a success notification
   */
  async sendSuccess(userId: string, title: string, message: string, data?: any): Promise<boolean> {
    return this.sendToUser(userId, {
      id: `success_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "success",
      title,
      message,
      data,
    });
  }

  /**
   * Sends an error notification
   */
  async sendError(userId: string, title: string, message: string, data?: any): Promise<boolean> {
    return this.sendToUser(userId, {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "error",
      title,
      message,
      data,
    });
  }

  /**
   * Sends a warning notification
   */
  async sendWarning(userId: string, title: string, message: string, data?: any): Promise<boolean> {
    return this.sendToUser(userId, {
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "warning",
      title,
      message,
      data,
    });
  }

  /**
   * Sends an info notification
   */
  async sendInfo(userId: string, title: string, message: string, data?: any): Promise<boolean> {
    return this.sendToUser(userId, {
      id: `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "info",
      title,
      message,
      data,
    });
  }

  /**
   * Sends system maintenance notification
   */
  async sendMaintenanceNotification(
    scheduledTime: Date,
    duration: string,
    reason?: string
  ): Promise<void> {
    const notification: Omit<NotificationPayload, "timestamp"> = {
      id: `maintenance_${Date.now()}`,
      type: "warning",
      title: "Scheduled Maintenance",
      message: `System maintenance scheduled for ${scheduledTime.toLocaleString()}. Expected duration: ${duration}.${reason ? ` Reason: ${reason}` : ""}`,
      data: {
        scheduledTime: scheduledTime.toISOString(),
        duration,
        reason,
      },
    };

    await this.sendToAll(notification);
  }

  /**
   * Sends user mention notification
   */
  async sendMentionNotification(
    mentionedUserId: string,
    mentionerUserId: string,
    mentionerName: string,
    roomId: string,
    messageContent: string
  ): Promise<boolean> {
    if (!isUserInRoom(mentionedUserId, roomId)) {
      return false;
    }

    return this.sendToUser(mentionedUserId, {
      id: `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "info",
      title: "You were mentioned",
      message: `${mentionerName} mentioned you: "${messageContent.substring(0, 100)}${messageContent.length > 100 ? "..." : ""}"`,
      data: {
        roomId,
        mentionerUserId,
        mentionerName,
        messageContent,
      },
    });
  }

  /**
   * Sends friend request notification
   */
  async sendFriendRequestNotification(
    receiverId: string,
    senderId: string,
    senderName: string
  ): Promise<boolean> {
    return this.sendToUser(receiverId, {
      id: `friend_request_${senderId}_${Date.now()}`,
      type: "info",
      title: "New Friend Request",
      message: `${senderName} sent you a friend request`,
      data: {
        senderId,
        senderName,
        type: "friend_request",
      },
    });
  }

  /**
   * Sends room invitation notification
   */
  async sendRoomInvitationNotification(
    inviteeId: string,
    inviterId: string,
    inviterName: string,
    roomId: string,
    roomName: string
  ): Promise<boolean> {
    return this.sendToUser(inviteeId, {
      id: `room_invite_${roomId}_${Date.now()}`,
      type: "info",
      title: "Room Invitation",
      message: `${inviterName} invited you to join "${roomName}"`,
      data: {
        inviterId,
        inviterName,
        roomId,
        roomName,
        type: "room_invitation",
      },
    });
  }

  /**
   * Sends security alert notification
   */
  async sendSecurityAlert(
    userId: string,
    alertType: string,
    description: string,
    ipAddress?: string
  ): Promise<boolean> {
    return this.sendToUser(userId, {
      id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "warning",
      title: "Security Alert",
      message: `${alertType}: ${description}${ipAddress ? ` from IP ${ipAddress}` : ""}`,
      data: {
        alertType,
        description,
        ipAddress,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Sends bulk notifications with rate limiting
   */
  async sendBulkNotifications(
    notifications: Array<{
      userId: string;
      notification: Omit<NotificationPayload, "timestamp">;
    }>,
    batchSize: number = 50,
    delayMs: number = 100
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      
      const promises = batch.map(async ({ userId, notification }) => {
        try {
          const result = await this.sendToUser(userId, notification);
          return result ? "success" : "failed";
        } catch (error) {
          logger.error(`Error sending notification to user ${userId}:`, error);
          return "failed";
        }
      });

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        if (result === "success") {
          success++;
        } else {
          failed++;
        }
      });

      // Add delay between batches to avoid overwhelming the system
      if (i + batchSize < notifications.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    logger.info(`Bulk notifications completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }
}