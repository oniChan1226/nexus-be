// src/modules/notifications/notification.route.ts
import { Router } from "express";
import {
  sendUserNotification,
  sendRoomNotification,
  sendSystemAnnouncement,
  sendBulkNotifications,
  simulateNotificationScenarios,
  getNotificationAnalytics
} from "./notification.controller";

const router = Router();

/**
 * @route   POST /api/notifications/user
 * @desc    Send notification to a specific user
 * @body    { userId, type, title, message, data }
 */
router.post("/user", sendUserNotification);

/**
 * @route   POST /api/notifications/room
 * @desc    Send notification to all users in a room
 * @body    { roomId, type, title, message, data }
 */
router.post("/room", sendRoomNotification);

/**
 * @route   POST /api/notifications/announcement
 * @desc    Send system-wide announcement
 * @body    { type, title, message, data }
 */
router.post("/announcement", sendSystemAnnouncement);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Send bulk notifications
 * @body    { notifications, batchSize, delayMs }
 */
router.post("/bulk", sendBulkNotifications);

/**
 * @route   POST /api/notifications/simulate/:scenario
 * @desc    Simulate notification scenarios for demo
 * @params  scenario (welcome, security, social, system, task)
 */
router.post("/simulate/:scenario", simulateNotificationScenarios);

/**
 * @route   GET /api/notifications/analytics
 * @desc    Get notification analytics and statistics
 */
router.get("/analytics", getNotificationAnalytics);

export default router;