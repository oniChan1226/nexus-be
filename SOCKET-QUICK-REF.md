# 🚀 Socket.IO Quick Reference Card

## Is Your Socket Connected?

### ✅ YES, if you see in backend logs:
```
Socket [socket-id]: Authenticated user [user-id] (email@example.com)
```

### ❌ NO, if you see:
```
Socket [socket-id]: Connected without authentication
```
This means you're connected as a guest (no token provided).

---

## 🔐 How Authentication Works

1. **User logs in** → Gets JWT token from `/api/auth/login`
2. **Frontend stores token** → localStorage/state
3. **Socket connects with token**:
   ```javascript
   io('http://localhost:8080', {
     auth: { token: yourJWTToken }
   })
   ```
4. **Backend validates token** → Attaches user to socket
5. **Socket is now authenticated** ✅

---

## 📨 Quick Test - Send Yourself a Notification

### Step 1: Get Your User ID
After logging in, your response looks like:
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "6904fa3b84d6cac64796041e",  // ← THIS IS YOUR USER ID
      "email": "admin@example.com",
      ...
    }
  }
}
```

### Step 2: Send Notification
```bash
curl -X POST http://localhost:8080/api/notifications/user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "6904fa3b84d6cac64796041e",
    "type": "success",
    "title": "Test Notification",
    "message": "Hello from the backend!"
  }'
```

### Step 3: Check Frontend
Your socket should receive the `notification` event:
```javascript
socket.on('notification', (data) => {
  console.log('🔔 Received:', data);
  // Show toast/alert in your UI
});
```

---

## 🧪 Testing Methods

### Method 1: HTML Test Client (Easiest!)
```bash
# Open in browser:
test/socket-test-ui.html
```
- Beautiful UI with all features
- No coding required
- Test everything visually

### Method 2: Browser Console
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => console.log('Connected:', socket.id));
socket.on('notification', (data) => console.log('Notification:', data));
```

### Method 3: REST API Endpoints
Use Postman/Thunder Client or curl:
- `POST /api/notifications/user` - Send to specific user
- `POST /api/notifications/announcement` - Broadcast to all
- `POST /api/notifications/room` - Send to room users

---

## 📋 Seeded User Credentials

| Email | Password | Role | User ID |
|-------|----------|------|---------|
| admin@example.com | Admin@1234 | ADMIN | Use from your DB |
| manager@example.com | Manager@1234 | MANAGER | Use from your DB |
| user@example.com | User@1234 | USER | Use from your DB |
| guest@example.com | Guest@1234 | GUEST | Use from your DB |

**To get User IDs:**
```bash
# Login and check response
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin@1234"}'
```

---

## 🎯 Common Use Cases

### 1. Real-time Notifications
```javascript
// Backend sends
socketService.sendToUser(userId, {
  type: 'success',
  title: 'Welcome!',
  message: 'Your account is now active'
});

// Frontend receives
socket.on('notification', (data) => {
  showToast(data);
});
```

### 2. Chat Rooms
```javascript
// Join room
socket.emit('join_room', { roomId: 'general' });

// Send message
socket.emit('send_message', { 
  roomId: 'general', 
  message: 'Hello everyone!' 
});

// Receive messages
socket.on('message_received', (data) => {
  addMessageToChat(data);
});
```

### 3. User Status
```javascript
// Update status
socket.emit('update_status', { status: 'online' });

// Listen for others
socket.on('user_status_updated', (data) => {
  updateUserBadge(data.userId, data.status);
});
```

### 4. Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', { roomId: 'general' });

// Stop typing
socket.emit('typing_stop', { roomId: 'general' });

// Show indicator
socket.on('typing_started', (data) => {
  showTypingIndicator(data.userId);
});
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** "Connection refused"
- ✅ Check if backend is running (`npm run dev`)
- ✅ Verify port (should be 8080)

**Problem:** "Authentication failed"
- ✅ Check token is valid (not expired)
- ✅ Verify token format: `Bearer <token>` or just `<token>`
- ✅ Check backend logs for error details

**Problem:** "CORS error"
- ✅ Backend CORS is configured for `localhost:3000` and `localhost:8080`
- ✅ Add your frontend URL to `config/env.ts` if different

### Notification Not Received

**Checklist:**
- [ ] Backend server running
- [ ] Socket connected (check `socket.connected`)
- [ ] User authenticated (check backend logs)
- [ ] Correct User ID used
- [ ] Listening to `notification` event
- [ ] Check browser console for errors

---

## 📁 File Structure Reference

```
src/
├── socket/
│   ├── SocketManager.ts          # Main orchestrator
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT validation
│   │   ├── rateLimit.middleware.ts
│   │   └── logging.middleware.ts
│   ├── handlers/                 # Event handlers
│   │   ├── connection.ts
│   │   ├── room.ts
│   │   ├── message.ts
│   │   └── user.ts
│   ├── services/
│   │   ├── SocketService.ts      # Core socket operations
│   │   └── NotificationService.ts # Notification management
│   └── utils/                    # Helper functions
├── modules/
│   └── notifications/
│       ├── notification.controller.ts  # REST endpoints
│       └── notification.route.ts
└── config/
    └── socket.ts                # Socket.IO configuration
```

---

## 🎨 Frontend Integration Snippets

### React Hook
```jsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

function useSocket(token) {
  useEffect(() => {
    if (!token) return;
    
    const socket = io('http://localhost:8080', {
      auth: { token }
    });

    socket.on('notification', (data) => {
      // Show notification
    });

    return () => socket.disconnect();
  }, [token]);
}
```

### Vue Composable
```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const socket = ref(null);
  
  onMounted(() => {
    if (token) {
      socket.value = io('http://localhost:8080', {
        auth: { token }
      });
    }
  });
  
  onUnmounted(() => {
    socket.value?.disconnect();
  });
  
  return { socket };
}
```

### Angular Service
```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  connect(token: string) {
    this.socket = io('http://localhost:8080', {
      auth: { token }
    });
  }
}
```

---

## ✅ Success Indicators

You know it's working when:
- ✅ Backend logs show: `Socket authenticated user [id]`
- ✅ Browser console shows: `Connected: [socket-id]`
- ✅ Test notification arrives in frontend
- ✅ No CORS errors in console
- ✅ Socket status shows connected

---

## 🆘 Need Help?

1. **Check backend logs** - Most issues are logged there
2. **Open browser DevTools** - Check Console and Network tabs
3. **Use test HTML file** - `test/socket-test-ui.html`
4. **Read full guide** - `SOCKET-FRONTEND-GUIDE.md`
5. **Test REST endpoints** - Verify backend is working

---

**Remember:** Socket.IO automatically reconnects if connection drops, handles heartbeats, and falls back to polling if WebSocket fails. Your setup is production-ready! 🚀
