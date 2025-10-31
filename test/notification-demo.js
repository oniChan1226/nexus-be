// test/notification-demo.js
// Real-world notification system demonstration
// Shows various notification use cases and patterns

const io = require('socket.io-client');

// Demo configuration
const SOCKET_URL = 'http://localhost:5000';
const DEMO_USERS = [
  { name: 'Alice', role: 'admin', token: 'admin-token' },
  { name: 'Bob', role: 'user', token: 'user-token' },
  { name: 'Charlie', role: 'moderator', token: 'mod-token' }
];

// Colors for better visualization
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

class NotificationDemoClient {
  constructor(user) {
    this.user = user;
    this.socket = null;
    this.notifications = [];
  }

  connect() {
    log(`🔌 ${this.user.name}: Connecting...`, colors.cyan);
    
    this.socket = io(SOCKET_URL, {
      auth: { token: this.user.token },
      transports: ['websocket', 'polling']
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      log(`✅ ${this.user.name}: Connected (${this.user.role})`, colors.green);
    });

    this.socket.on('notification', (notification) => {
      this.notifications.push(notification);
      const typeIcon = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      
      log(
        `${typeIcon[notification.type]} ${this.user.name}: [${notification.type.toUpperCase()}] ${notification.title} - ${notification.message}`,
        this.getColorForType(notification.type)
      );
      
      // Log additional data if present
      if (notification.data) {
        log(`   📊 Data: ${JSON.stringify(notification.data)}`, colors.dim);
      }
    });

    this.socket.on('room_message', (message) => {
      log(`💬 ${this.user.name}: Message in ${message.roomId}: ${message.content}`, colors.yellow);
    });

    this.socket.on('user_online', (userId) => {
      log(`🟢 ${this.user.name}: ${userId} came online`, colors.green);
    });

    this.socket.on('user_offline', (userId) => {
      log(`🔴 ${this.user.name}: ${userId} went offline`, colors.red);
    });
  }

  getColorForType(type) {
    const colorMap = {
      info: colors.blue,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red
    };
    return colorMap[type] || colors.reset;
  }

  joinRoom(roomId) {
    this.socket.emit('join_room', roomId, (response) => {
      if (response.success) {
        log(`🏠 ${this.user.name}: Joined room ${roomId}`, colors.blue);
      }
    });
  }

  sendMessage(roomId, content) {
    this.socket.emit('send_message', {
      roomId,
      content,
      type: 'text'
    });
  }

  updateStatus(status) {
    this.socket.emit('update_status', status);
  }

  getNotificationStats() {
    const stats = this.notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: this.notifications.length,
      byType: stats,
      latest: this.notifications.slice(-3)
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      log(`🛑 ${this.user.name}: Disconnected`, colors.yellow);
    }
  }
}

// Notification Service Simulator (simulates server-side notifications)
class NotificationSimulator {
  constructor(clients) {
    this.clients = clients;
  }

  // Simulate various notification scenarios
  async runScenarios() {
    console.log(`${colors.bright}\n🎭 Starting Notification Scenarios Demo${colors.reset}\n`);

    await this.scenario1_WelcomeNotifications();
    await this.scenario2_SystemAnnouncements();
    await this.scenario3_UserInteractions();
    await this.scenario4_SecurityAlerts();
    await this.scenario5_TaskNotifications();
    await this.scenario6_SocialNotifications();
    await this.scenario7_MaintenanceNotifications();
    await this.scenario8_AdminNotifications();

    console.log(`\n${colors.bright}🎯 All notification scenarios completed!${colors.reset}`);
    this.showStatistics();
  }

  async scenario1_WelcomeNotifications() {
    console.log(`\n${colors.bright}📋 Scenario 1: Welcome & Onboarding Notifications${colors.reset}`);
    
    // Simulate welcome notifications (these would be sent from server)
    for (const client of this.clients) {
      await this.sleep(1000);
      this.sendMockNotification(client, {
        type: 'success',
        title: 'Welcome!',
        message: `Welcome to the platform, ${client.user.name}! Your ${client.user.role} account is ready.`,
        data: {
          userId: client.user.name.toLowerCase(),
          role: client.user.role,
          loginTime: new Date().toISOString()
        }
      });
    }
  }

  async scenario2_SystemAnnouncements() {
    console.log(`\n${colors.bright}📢 Scenario 2: System-wide Announcements${colors.reset}`);
    
    await this.sleep(2000);
    
    // System maintenance announcement
    this.broadcastNotification({
      type: 'warning',
      title: 'Scheduled Maintenance',
      message: 'System maintenance will begin in 30 minutes. Please save your work.',
      data: {
        maintenanceStart: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        expectedDuration: '2 hours',
        affectedServices: ['chat', 'file-upload']
      }
    });

    await this.sleep(2000);

    // New feature announcement
    this.broadcastNotification({
      type: 'info',
      title: 'New Feature Available',
      message: 'We\'ve added real-time collaboration tools! Check them out in the workspace section.',
      data: {
        featureName: 'Real-time Collaboration',
        version: '2.1.0',
        learnMoreUrl: '/features/collaboration'
      }
    });
  }

  async scenario3_UserInteractions() {
    console.log(`\n${colors.bright}👥 Scenario 3: User Interaction Notifications${colors.reset}`);
    
    // Join rooms to enable interactions
    this.clients.forEach(client => {
      client.joinRoom('general');
    });
    
    await this.sleep(2000);

    // Friend request simulation
    this.sendMockNotification(this.clients[1], {
      type: 'info',
      title: 'Friend Request',
      message: `${this.clients[0].user.name} sent you a friend request`,
      data: {
        type: 'friend_request',
        senderId: this.clients[0].user.name.toLowerCase(),
        senderName: this.clients[0].user.name,
        timestamp: new Date().toISOString()
      }
    });

    await this.sleep(1500);

    // Message mention simulation
    this.sendMockNotification(this.clients[2], {
      type: 'info',
      title: 'You were mentioned',
      message: `${this.clients[0].user.name} mentioned you in #general: "Hey @${this.clients[2].user.name}, what do you think?"`,
      data: {
        type: 'mention',
        roomId: 'general',
        mentionerId: this.clients[0].user.name.toLowerCase(),
        messageId: 'msg_12345'
      }
    });
  }

  async scenario4_SecurityAlerts() {
    console.log(`\n${colors.bright}🔐 Scenario 4: Security & Authentication Alerts${colors.reset}`);
    
    await this.sleep(2000);

    // New login alert
    this.sendMockNotification(this.clients[0], {
      type: 'warning',
      title: 'New Login Detected',
      message: 'A new login to your account was detected from Chrome on Windows.',
      data: {
        type: 'security_alert',
        loginTime: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/118.0.0.0 Windows',
        location: 'New York, US'
      }
    });

    await this.sleep(1500);

    // Password change confirmation
    this.sendMockNotification(this.clients[1], {
      type: 'success',
      title: 'Password Changed',
      message: 'Your password has been successfully updated.',
      data: {
        type: 'password_change',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.101'
      }
    });

    await this.sleep(1500);

    // Suspicious activity alert
    this.sendMockNotification(this.clients[2], {
      type: 'error',
      title: 'Suspicious Activity Detected',
      message: 'Multiple failed login attempts detected. Your account has been temporarily locked.',
      data: {
        type: 'account_locked',
        failedAttempts: 5,
        lockDuration: '15 minutes',
        timestamp: new Date().toISOString()
      }
    });
  }

  async scenario5_TaskNotifications() {
    console.log(`\n${colors.bright}📋 Scenario 5: Task & Workflow Notifications${colors.reset}`);
    
    await this.sleep(2000);

    // Task assignment
    this.sendMockNotification(this.clients[1], {
      type: 'info',
      title: 'New Task Assigned',
      message: 'You have been assigned to "Implement user dashboard" by Alice',
      data: {
        type: 'task_assignment',
        taskId: 'TASK-001',
        taskTitle: 'Implement user dashboard',
        assignerId: 'alice',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      }
    });

    await this.sleep(1500);

    // Task completed
    this.sendMockNotification(this.clients[0], {
      type: 'success',
      title: 'Task Completed',
      message: 'Bob completed "Fix login bug" ahead of schedule!',
      data: {
        type: 'task_completed',
        taskId: 'TASK-002',
        taskTitle: 'Fix login bug',
        completedBy: 'bob',
        completedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    await this.sleep(1500);

    // Deadline reminder
    this.sendMockNotification(this.clients[2], {
      type: 'warning',
      title: 'Task Due Soon',
      message: 'Your task "Review code changes" is due in 2 hours',
      data: {
        type: 'deadline_reminder',
        taskId: 'TASK-003',
        taskTitle: 'Review code changes',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        hoursRemaining: 2
      }
    });
  }

  async scenario6_SocialNotifications() {
    console.log(`\n${colors.bright}💫 Scenario 6: Social & Community Notifications${colors.reset}`);
    
    await this.sleep(2000);

    // Post liked
    this.sendMockNotification(this.clients[0], {
      type: 'info',
      title: 'Your post was liked',
      message: 'Bob and 3 others liked your post "Socket.IO best practices"',
      data: {
        type: 'post_interaction',
        postId: 'post_123',
        postTitle: 'Socket.IO best practices',
        likeCount: 4,
        latestLiker: 'bob'
      }
    });

    await this.sleep(1500);

    // New follower
    this.sendMockNotification(this.clients[1], {
      type: 'success',
      title: 'New Follower',
      message: 'Charlie is now following you!',
      data: {
        type: 'new_follower',
        followerId: 'charlie',
        followerName: 'Charlie',
        followCount: 127
      }
    });

    await this.sleep(1500);

    // Comment on post
    this.sendMockNotification(this.clients[0], {
      type: 'info',
      title: 'New Comment',
      message: 'Charlie commented on your post: "Great insights! Thanks for sharing."',
      data: {
        type: 'post_comment',
        postId: 'post_123',
        commenterId: 'charlie',
        commenterName: 'Charlie',
        commentPreview: 'Great insights! Thanks for sharing.'
      }
    });
  }

  async scenario7_MaintenanceNotifications() {
    console.log(`\n${colors.bright}🔧 Scenario 7: System Maintenance & Updates${colors.reset}`);
    
    await this.sleep(2000);

    // Maintenance starting
    this.broadcastNotification({
      type: 'warning',
      title: 'Maintenance Starting',
      message: 'System maintenance is beginning now. Some features may be temporarily unavailable.',
      data: {
        type: 'maintenance_start',
        startTime: new Date().toISOString(),
        expectedDuration: '30 minutes',
        affectedFeatures: ['file upload', 'real-time sync']
      }
    });

    await this.sleep(3000);

    // Maintenance completed
    this.broadcastNotification({
      type: 'success',
      title: 'Maintenance Complete',
      message: 'System maintenance has been completed successfully. All features are now available.',
      data: {
        type: 'maintenance_complete',
        completedAt: new Date().toISOString(),
        actualDuration: '25 minutes',
        improvements: ['Faster file uploads', 'Enhanced security', 'Bug fixes']
      }
    });
  }

  async scenario8_AdminNotifications() {
    console.log(`\n${colors.bright}👑 Scenario 8: Admin & Moderation Notifications${colors.reset}`);
    
    // Only send admin notifications to admin users
    const adminClient = this.clients.find(client => client.user.role === 'admin');
    const modClient = this.clients.find(client => client.user.role === 'moderator');
    
    await this.sleep(2000);

    if (adminClient) {
      // New user registration
      this.sendMockNotification(adminClient, {
        type: 'info',
        title: 'New User Registration',
        message: 'A new user "john_doe" has registered and requires approval',
        data: {
          type: 'user_registration',
          userId: 'john_doe',
          email: 'john.doe@example.com',
          registrationDate: new Date().toISOString(),
          requiresApproval: true
        }
      });

      await this.sleep(1500);

      // System alert
      this.sendMockNotification(adminClient, {
        type: 'error',
        title: 'High CPU Usage Alert',
        message: 'Server CPU usage has exceeded 90% for the last 5 minutes',
        data: {
          type: 'system_alert',
          metric: 'cpu_usage',
          currentValue: 92.5,
          threshold: 90,
          duration: '5 minutes',
          serverId: 'web-server-01'
        }
      });
    }

    if (modClient) {
      await this.sleep(1500);

      // Content reported
      this.sendMockNotification(modClient, {
        type: 'warning',
        title: 'Content Reported',
        message: 'A user reported inappropriate content in #general channel',
        data: {
          type: 'content_report',
          reportId: 'RPT-001',
          reportedBy: 'user123',
          contentId: 'msg_456',
          reason: 'inappropriate language',
          channel: 'general'
        }
      });
    }
  }

  // Helper methods
  sendMockNotification(client, notification) {
    // In a real app, this would be sent from the server
    // For demo purposes, we're simulating receiving notifications
    const fullNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...notification
    };
    
    client.socket.emit('notification', fullNotification);
  }

  broadcastNotification(notification) {
    this.clients.forEach(client => {
      this.sendMockNotification(client, notification);
    });
  }

  showStatistics() {
    console.log(`\n${colors.bright}📊 Notification Statistics:${colors.reset}`);
    
    this.clients.forEach(client => {
      const stats = client.getNotificationStats();
      console.log(`\n${colors.cyan}${client.user.name} (${client.user.role}):${colors.reset}`);
      console.log(`  Total notifications: ${stats.total}`);
      console.log(`  By type: ${JSON.stringify(stats.byType, null, 2)}`);
      
      if (stats.latest.length > 0) {
        console.log(`  Latest notifications:`);
        stats.latest.forEach(notif => {
          console.log(`    - ${notif.type}: ${notif.title}`);
        });
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main demo execution
async function runNotificationDemo() {
  console.log(`${colors.bright}🔔 Socket.IO Notification System Demo${colors.reset}`);
  console.log(`${colors.dim}Demonstrating various real-world notification patterns...${colors.reset}\n`);

  // Create demo clients
  const clients = DEMO_USERS.map(user => new NotificationDemoClient(user));
  
  // Connect all clients
  console.log(`${colors.bright}🔌 Connecting demo users...${colors.reset}`);
  for (const client of clients) {
    client.connect();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Wait for connections to stabilize
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create and run notification simulator
  const simulator = new NotificationSimulator(clients);
  await simulator.runScenarios();

  // Keep demo running for a bit to show interactions
  console.log(`\n${colors.dim}Demo will automatically close in 10 seconds...${colors.reset}`);
  setTimeout(() => {
    console.log(`\n${colors.bright}🧹 Cleaning up demo...${colors.reset}`);
    clients.forEach(client => client.disconnect());
    process.exit(0);
  }, 10000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Demo interrupted. Cleaning up...');
  process.exit(0);
});

// Start the demo
runNotificationDemo().catch(console.error);