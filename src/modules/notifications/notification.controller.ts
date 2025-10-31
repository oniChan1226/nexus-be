// src/modules/notifications/notification.controller.ts
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { socketManager } from "../../socket";
import logger from "../../config/logger";

/**
 * Notification Controller - Demonstrates real-world notification use cases
 */

/**
 * Send notification to specific user
 */
export const sendUserNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, type, title, message, data } = req.body;

  try {
    const notificationService = socketManager.getNotificationService();
    
    const success = await notificationService.sendToUser(userId, {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'info',
      title,
      message,
      data
    });

    if (success) {
      logger.info(`Notification sent to user ${userId}: ${title}`);
      res.status(200).json(
        new ApiResponse(200, "Notification sent successfully", { sent: true })
      );
    } else {
      res.status(400).json(
        new ApiResponse(400, "User is offline or notification failed", { sent: false })
      );
    }
  } catch (error) {
    logger.error("Error sending user notification:", error);
    res.status(500).json(
      new ApiResponse(500, "Failed to send notification", null)
    );
  }
});

/**
 * Send notification to all users in a room
 */
export const sendRoomNotification = asyncHandler(async (req: Request, res: Response) => {
  const { roomId, type, title, message, data } = req.body;

  try {
    const notificationService = socketManager.getNotificationService();
    
    await notificationService.sendToRoom(roomId, {
      id: `room_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'info',
      title,
      message,
      data
    });

    logger.info(`Room notification sent to ${roomId}: ${title}`);
    res.status(200).json(
      new ApiResponse(200, "Room notification sent successfully", { sent: true })
    );
  } catch (error) {
    logger.error("Error sending room notification:", error);
    res.status(500).json(
      new ApiResponse(500, "Failed to send room notification", null)
    );
  }
});

/**
 * Send system-wide announcement
 */
export const sendSystemAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { type, title, message, data } = req.body;

  try {
    const socketService = socketManager.getSocketService();
    
    await socketService.broadcastAnnouncement(
      title,
      message,
      type || 'info'
    );

    logger.info(`System announcement sent: ${title}`);
    res.status(200).json(
      new ApiResponse(200, "System announcement sent successfully", { sent: true })
    );
  } catch (error) {
    logger.error("Error sending system announcement:", error);
    res.status(500).json(
      new ApiResponse(500, "Failed to send system announcement", null)
    );
  }
});

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { notifications, batchSize, delayMs } = req.body;

  try {
    const notificationService = socketManager.getNotificationService();
    
    const result = await notificationService.sendBulkNotifications(
      notifications,
      batchSize || 50,
      delayMs || 100
    );

    logger.info(`Bulk notifications completed: ${result.success} success, ${result.failed} failed`);
    res.status(200).json(
      new ApiResponse(200, "Bulk notifications processed", result)
    );
  } catch (error) {
    logger.error("Error sending bulk notifications:", error);
    res.status(500).json(
      new ApiResponse(500, "Failed to process bulk notifications", null)
    );
  }
});

/**
 * Simulate various notification scenarios for demo purposes
 */
export const simulateNotificationScenarios = asyncHandler(async (req: Request, res: Response) => {
  const { scenario } = req.params;

  try {
    const notificationService = socketManager.getNotificationService();
    const socketService = socketManager.getSocketService();

    switch (scenario) {
      case 'welcome':
        await simulateWelcomeFlow(notificationService);
        break;
      
      case 'security':
        await simulateSecurityAlerts(notificationService);
        break;
      
      case 'social':
        await simulateSocialNotifications(notificationService);
        break;
      
      case 'system':
        await simulateSystemNotifications(socketService);
        break;
      
      case 'task':
        await simulateTaskNotifications(notificationService);
        break;
      
      default:
        return res.status(400).json(
          new ApiResponse(400, "Invalid scenario. Available: welcome, security, social, system, task", null)
        );
    }

    res.status(200).json(
      new ApiResponse(200, `${scenario} notification scenario executed successfully`, { scenario })
    );
  } catch (error) {
    logger.error(`Error simulating ${scenario} scenario:`, error);
    res.status(500).json(
      new ApiResponse(500, `Failed to simulate ${scenario} scenario`, null)
    );
  }
});

/**
 * Get notification analytics
 */
export const getNotificationAnalytics = asyncHandler(async (req: Request, res: Response) => {
  try {
    const stats = socketManager.getStats();
    
    // In a real application, you'd fetch this from a database
    const analytics = {
      serverStats: stats,
      notificationMetrics: {
        totalSentToday: 1247,
        deliveryRate: 98.5,
        averageResponseTime: '45ms',
        topNotificationTypes: [
          { type: 'info', count: 856 },
          { type: 'success', count: 234 },
          { type: 'warning', count: 123 },
          { type: 'error', count: 34 }
        ],
        peakHours: '2:00 PM - 4:00 PM',
        mostActiveUsers: [
          { userId: 'user123', notificationsReceived: 45 },
          { userId: 'user456', notificationsReceived: 38 },
          { userId: 'user789', notificationsReceived: 32 }
        ]
      }
    };

    res.status(200).json(
      new ApiResponse(200, "Notification analytics retrieved successfully", analytics)
    );
  } catch (error) {
    logger.error("Error getting notification analytics:", error);
    res.status(500).json(
      new ApiResponse(500, "Failed to get notification analytics", null)
    );
  }
});

// Simulation helper functions
async function simulateWelcomeFlow(notificationService: any) {
  const userId = 'demo-user-123';
  
  // Welcome notification
  await notificationService.sendSuccess(
    userId,
    'Welcome!',
    'Welcome to our platform! Your account has been successfully created.'
  );

  // Tutorial prompt
  setTimeout(async () => {
    await notificationService.sendInfo(
      userId,
      'Getting Started',
      'Would you like to take a quick tutorial to learn the basics?',
      { action: 'start_tutorial', url: '/tutorial' }
    );
  }, 2000);

  // Feature highlight
  setTimeout(async () => {
    await notificationService.sendInfo(
      userId,
      'New Feature',
      'Check out our new real-time collaboration tools!',
      { featureName: 'collaboration', version: '2.1.0' }
    );
  }, 5000);
}

async function simulateSecurityAlerts(notificationService: any) {
  const userId = 'demo-user-123';
  
  // Login alert
  await notificationService.sendWarning(
    userId,
    'New Login Detected',
    'Someone logged into your account from a new device.',
    { 
      device: 'Chrome on Windows',
      location: 'New York, US',
      timestamp: new Date().toISOString()
    }
  );

  // Suspicious activity
  setTimeout(async () => {
    await notificationService.sendError(
      userId,
      'Suspicious Activity',
      'Multiple failed login attempts detected. Account temporarily locked.',
      { lockDuration: '15 minutes', attemptsCount: 5 }
    );
  }, 3000);
}

async function simulateSocialNotifications(notificationService: any) {
  const userId = 'demo-user-123';
  
  // Friend request
  await notificationService.sendInfo(
    userId,
    'Friend Request',
    'John Doe sent you a friend request',
    { type: 'friend_request', senderId: 'john_doe', senderName: 'John Doe' }
  );

  // Post interaction
  setTimeout(async () => {
    await notificationService.sendInfo(
      userId,
      'Post Liked',
      'Sarah and 5 others liked your post "Socket.IO Tutorial"',
      { 
        type: 'post_like',
        postId: 'post_123',
        likeCount: 6,
        latestLiker: 'Sarah'
      }
    );
  }, 2000);

  // Mention
  setTimeout(async () => {
    await notificationService.sendInfo(
      userId,
      'You were mentioned',
      'Mike mentioned you in #development: "Great work on the API!"',
      {
        type: 'mention',
        roomId: 'development',
        mentionerId: 'mike',
        messageId: 'msg_456'
      }
    );
  }, 4000);
}

async function simulateSystemNotifications(socketService: any) {
  // System maintenance
  await socketService.broadcastAnnouncement(
    'Scheduled Maintenance',
    'System will undergo maintenance tonight from 2 AM to 4 AM EST.',
    'warning'
  );

  // New features
  setTimeout(async () => {
    await socketService.broadcastAnnouncement(
      'New Feature Release',
      'We\'ve released new dashboard analytics! Check them out now.',
      'success'
    );
  }, 3000);
}

async function simulateTaskNotifications(notificationService: any) {
  const userId = 'demo-user-123';
  
  // Task assignment
  await notificationService.sendInfo(
    userId,
    'New Task Assigned',
    'You have been assigned to "Fix user authentication bug"',
    {
      type: 'task_assignment',
      taskId: 'TASK-001',
      assignerId: 'project_manager',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  );

  // Deadline reminder
  setTimeout(async () => {
    await notificationService.sendWarning(
      userId,
      'Task Due Soon',
      'Your task "Update documentation" is due in 2 hours',
      {
        type: 'deadline_reminder',
        taskId: 'TASK-002',
        hoursRemaining: 2
      }
    );
  }, 2000);

  // Task completed
  setTimeout(async () => {
    await notificationService.sendSuccess(
      userId,
      'Task Completed',
      'Great job! You completed "Implement user profile" ahead of schedule.',
      {
        type: 'task_completed',
        taskId: 'TASK-003',
        completedAhead: true
      }
    );
  }, 4000);
}