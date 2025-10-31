# 🔌 Socket.IO Frontend Integration Guide

## Overview

Your Socket.IO backend is running on the same port as your Express server (default: `http://localhost:8080`). The setup uses **optional authentication**, meaning:
- ✅ Guests can connect without a token (limited features)
- ✅ Authenticated users pass their JWT token and get full access

---

## 🚀 Quick Start - Frontend Connection

### 1. Install Socket.IO Client

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

### 2. Basic Connection (After Login)

```javascript
// src/services/socket.service.js or similar
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080'; // Your backend URL

class SocketService {
  constructor() {
    this.socket = null;
  }

  // Connect with JWT token (after user logs in)
  connect(token) {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token  // Pass JWT token from login
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    // Listen for notifications
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      // Show toast/notification in your UI
      this.showNotification(data);
    });

    // Listen for user-specific events
    this.socket.on('user_status_updated', (data) => {
      console.log('User status updated:', data);
    });

    this.socket.on('message_received', (data) => {
      console.log('💬 Message received:', data);
    });
  }

  showNotification(notification) {
    // Implement your notification UI logic
    // e.g., toast, badge, etc.
    console.log('Notification:', notification);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send events to server
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('join_room', { roomId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }

  sendMessage(roomId, message) {
    return new Promise((resolve, reject) => {
      this.socket.emit('send_message', { roomId, message }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }

  updateStatus(status) {
    this.socket.emit('update_status', { status });
  }
}

export default new SocketService();
```

---

## 🔐 Integration with Your Login Flow

### React Example

```jsx
// src/contexts/AuthContext.jsx or wherever you handle auth
import { useEffect } from 'react';
import socketService from '../services/socket.service';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token && user) {
      // Connect socket when user logs in
      socketService.connect(token);
    }

    return () => {
      // Disconnect when component unmounts or user logs out
      socketService.disconnect();
    };
  }, [token, user]);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.statusCode === 200) {
      setToken(data.data.tokens.accessToken);
      setUser(data.data.user);
      localStorage.setItem('token', data.data.tokens.accessToken);
      
      // Connect socket immediately after login
      socketService.connect(data.data.tokens.accessToken);
    }
  };

  const logout = () => {
    socketService.disconnect();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 📨 Testing Notifications

### Method 1: Using REST API Endpoints

You already have REST endpoints set up! Use them to test:

```bash
# 1. Get your user ID from login response
# When you sign in, save the user._id from the response

# 2. Send a notification to yourself
curl -X POST http://localhost:8080/api/notifications/user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "type": "success",
    "title": "Welcome!",
    "message": "Your account is now connected to real-time notifications"
  }'

# 3. Send a system announcement (all connected users)
curl -X POST http://localhost:8080/api/notifications/announcement \
  -H "Content-Type: application/json" \
  -d '{
    "type": "info",
    "title": "System Update",
    "message": "New features are now available!"
  }'
```

### Method 2: Using Postman/Thunder Client

Create requests for these endpoints:

**POST** `http://localhost:8080/api/notifications/user`
```json
{
  "userId": "6904fa3b84d6cac64796041e",  // Your user ID
  "type": "success",
  "title": "Test Notification",
  "message": "This is a test message",
  "data": {
    "url": "/dashboard",
    "action": "view"
  }
}
```

**POST** `http://localhost:8080/api/notifications/announcement`
```json
{
  "type": "warning",
  "title": "Maintenance Notice",
  "message": "Scheduled maintenance in 1 hour"
}
```

### Method 3: Frontend Testing Component

```jsx
// src/components/NotificationTest.jsx
import { useState } from 'react';

function NotificationTest() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test message');

  const sendTestNotification = async () => {
    const response = await fetch('http://localhost:8080/api/notifications/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type: 'info',
        title,
        message
      })
    });

    const data = await response.json();
    console.log('Notification sent:', data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Notifications</h2>
      <input 
        placeholder="User ID" 
        value={userId} 
        onChange={(e) => setUserId(e.target.value)}
      />
      <input 
        placeholder="Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
      />
      <input 
        placeholder="Message" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendTestNotification}>
        Send Notification
      </button>
    </div>
  );
}
```

---

## 🎯 Check If Socket is Connected

### In Browser Console

After logging in and connecting, open browser DevTools console:

```javascript
// Check if socket is connected
console.log('Socket connected:', socketService.socket?.connected);
console.log('Socket ID:', socketService.socket?.id);

// Manually listen for a notification
socketService.socket.on('notification', (data) => {
  console.log('🔔 Received:', data);
});
```

### Visual Indicator Component

```jsx
// src/components/SocketStatus.jsx
import { useState, useEffect } from 'react';
import socketService from '../services/socket.service';

function SocketStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setConnected(socketService.socket?.connected || false);
    };

    // Check every second
    const interval = setInterval(checkConnection, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      padding: '5px 10px',
      borderRadius: '5px',
      backgroundColor: connected ? '#4caf50' : '#f44336',
      color: 'white',
      fontSize: '12px'
    }}>
      {connected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  );
}
```

---

## 🧪 Complete Testing Flow

1. **Start Backend**
   ```bash
   npm run dev
   ```

2. **Login from Frontend**
   - Your app should call `/api/auth/login`
   - Save the access token
   - Connect socket with the token

3. **Verify Connection**
   - Check browser console for "Socket connected" log
   - Check backend logs for authentication message

4. **Send Test Notification**
   ```bash
   # Get your user ID from the login response
   curl -X POST http://localhost:8080/api/notifications/user \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "YOUR_USER_ID",
       "type": "success",
       "title": "Test",
       "message": "Hello from backend!"
     }'
   ```

5. **Check Frontend**
   - You should see the notification event in console
   - Your notification handler should trigger

---

## 📋 Available Events

### Events Frontend Can Emit (Send to Backend)

| Event | Data | Description |
|-------|------|-------------|
| `authenticate` | `{ token }` | Authenticate after connecting |
| `join_room` | `{ roomId }` | Join a chat room |
| `leave_room` | `{ roomId }` | Leave a chat room |
| `send_message` | `{ roomId, message }` | Send message to room |
| `update_status` | `{ status }` | Update user status (online/away/busy) |
| `typing_start` | `{ roomId }` | Notify others you're typing |
| `typing_stop` | `{ roomId }` | Stop typing indicator |

### Events Frontend Should Listen (Receive from Backend)

| Event | Data | Description |
|-------|------|-------------|
| `notification` | `{ id, type, title, message, data }` | Receive notification |
| `message_received` | `{ roomId, message, from, timestamp }` | New message in room |
| `user_status_updated` | `{ userId, status }` | User status changed |
| `room_joined` | `{ roomId, users }` | Successfully joined room |
| `room_left` | `{ roomId }` | Successfully left room |
| `typing_started` | `{ roomId, userId }` | User started typing |
| `typing_stopped` | `{ roomId, userId }` | User stopped typing |

---

## 🔍 Debugging Tips

### 1. Check Backend Logs
Look for these messages in your terminal:
```
Socket [socket-id]: Connected without authentication
Socket [socket-id]: Authenticated user [user-id] (email@example.com)
```

### 2. Network Tab
- Open DevTools → Network tab
- Filter by "WS" (WebSocket)
- Should see connection to `localhost:8080`

### 3. Console Errors
Common issues:
- **CORS Error**: Backend CORS is configured for `localhost:3000` and `localhost:8080`
- **401 Unauthorized**: Token is invalid or expired
- **Connection refused**: Backend is not running

---

## 💡 Real-World Example: Notification Toast

```jsx
// src/components/NotificationToast.jsx
import { useEffect, useState } from 'react';
import socketService from '../services/socket.service';

function NotificationToast() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (notification) => {
      setNotifications(prev => [...prev, notification]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    socketService.socket?.on('notification', handleNotification);

    return () => {
      socketService.socket?.off('notification', handleNotification);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      {notifications.map(notif => (
        <div key={notif.id} style={{
          backgroundColor: notif.type === 'error' ? '#f44336' : '#4caf50',
          color: 'white',
          padding: '15px',
          marginBottom: '10px',
          borderRadius: '5px',
          minWidth: '300px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <strong>{notif.title}</strong>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Success Checklist

- [ ] Backend server is running
- [ ] User is logged in and has JWT token
- [ ] Socket connects with token in `auth` object
- [ ] Browser console shows "Socket connected" message
- [ ] Backend logs show authenticated user
- [ ] Sending test notification via API works
- [ ] Frontend receives notification event
- [ ] Notification appears in UI

Your Socket.IO is now ready for real-time features! 🚀
