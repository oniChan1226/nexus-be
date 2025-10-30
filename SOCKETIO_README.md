# Socket.IO Implementation Guide

## Overview

This is a production-ready, scalable Socket.IO implementation for the Nexus Backend. It includes authentication, rate limiting, room management, message handling, and comprehensive error handling.

## Features

### 🔐 **Security & Authentication**
- JWT-based authentication middleware
- Rate limiting to prevent spam and abuse
- CORS configuration for cross-origin requests
- Optional authentication (supports both authenticated and guest users) 

### 🏠 **Room Management**
- Join/leave rooms with validation
- Room information and member tracking
- Automatic cleanup of empty rooms
- Room-based message broadcasting

### 💬 **Real-time Messaging**
- Send messages to rooms
- Typing indicators (start/stop)
- Message validation and sanitization
- Message history support (database integration ready)

### 👥 **User Management**
- User status updates (online, away, busy, offline)
- Online users tracking
- User profile management
- User search functionality

### 📊 **Monitoring & Analytics**
- Connection statistics and monitoring
- Performance tracking
- Comprehensive logging
- Health check endpoints

### 🔧 **Production Ready**
- Redis adapter for horizontal scaling
- Graceful shutdown handling
- Error handling and recovery
- Memory leak prevention with cleanup tasks

## Configuration

### Environment Variables

```bash
# Socket.IO Configuration
SOCKETIO_CORS_ORIGIN=http://localhost:3000,http://localhost:8080
SOCKETIO_CORS_CREDENTIALS=true
SOCKETIO_REDIS_ENABLED=true
SOCKETIO_REDIS_PREFIX=socket.io
SOCKETIO_RATE_LIMIT_WINDOW_MS=60000
SOCKETIO_RATE_LIMIT_MAX_REQUESTS=100
SOCKETIO_PING_TIMEOUT=60000
SOCKETIO_PING_INTERVAL=25000
SOCKETIO_MAX_PAYLOAD=1000000
```

## API Events

### Client to Server Events

#### Connection Events
- `authenticate(token, callback)` - Authenticate with JWT token
- `ping(callback)` - Ping the server

#### Room Events
- `join_room(roomId, callback)` - Join a room
- `leave_room(roomId, callback)` - Leave a room

#### Message Events
- `send_message(data, callback)` - Send message to room
- `typing_start(roomId)` - Start typing indicator
- `typing_stop(roomId)` - Stop typing indicator

#### User Events
- `update_status(status)` - Update user status

### Server to Client Events

#### Connection Events
- `connected(data)` - Welcome message on connection
- `error(error)` - Error notifications
- `rate_limit_exceeded(data)` - Rate limit notifications

#### Room Events
- `room_joined(data)` - User joined room notification
- `room_left(data)` - User left room notification
- `room_message(message)` - New message in room

#### User Events
- `user_updated(data)` - User profile/status updates
- `user_online(userId)` - User came online
- `user_offline(userId)` - User went offline
- `notification(notification)` - General notifications

## Usage Examples

### Basic Client Connection

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token' // Optional
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Joining a Room and Sending Messages

```javascript
// Join a room
socket.emit('join_room', 'general', (response) => {
  if (response.success) {
    console.log('Joined room:', response.roomId);
    
    // Send a message
    socket.emit('send_message', {
      roomId: 'general',
      content: 'Hello everyone!',
      type: 'text'
    }, (response) => {
      if (response.success) {
        console.log('Message sent:', response.message);
      }
    });
  }
});

// Listen for messages
socket.on('room_message', (message) => {
  console.log('New message:', message);
});
```

### User Status Management

```javascript
// Update status
socket.emit('update_status', 'online');

// Listen for user status updates
socket.on('user_updated', (data) => {
  console.log('User status updated:', data);
});
```

## Architecture

### Directory Structure

```
src/socket/
├── SocketManager.ts          # Main Socket.IO orchestrator
├── config/
│   └── socket.ts            # Socket.IO configuration
├── middlewares/
│   ├── auth.middleware.ts   # Authentication middleware
│   ├── rateLimit.middleware.ts # Rate limiting
│   └── logging.middleware.ts   # Logging and monitoring
├── handlers/
│   ├── connection.handler.ts   # Connection events
│   ├── room.handler.ts        # Room management
│   ├── message.handler.ts     # Message handling
│   └── user.handler.ts        # User management
├── services/
│   ├── SocketService.ts       # High-level socket operations
│   └── NotificationService.ts # Notification management
├── utils/
│   ├── validation.ts          # Input validation
│   ├── room.ts               # Room utilities
│   └── connection.ts         # Connection utilities
└── @types/
    └── socket.types.ts       # TypeScript definitions
```

### Key Components

#### SocketManager
Central orchestrator that initializes Socket.IO server, sets up middlewares, and configures event handlers.

#### Middlewares
- **Authentication**: Validates JWT tokens and attaches user data
- **Rate Limiting**: Prevents spam and abuse
- **Logging**: Comprehensive request and error logging

#### Event Handlers
Modular event handlers for different functional areas:
- Connection management
- Room operations
- Message handling
- User management

#### Services
High-level service classes for complex operations:
- SocketService: Broadcasting, room management, user operations
- NotificationService: Notification delivery and management

#### Utilities
Helper functions for validation, room management, and connection tracking.

## Testing

### Run Test Client

```bash
# Install socket.io-client for testing
npm install socket.io-client

# Run the test client
node test/socket-client.js
```

### Health Checks

```bash
# Check server health
curl http://localhost:5000/health

# Check Socket.IO status
curl http://localhost:5000/socket-status
```

## Production Deployment

### Redis Setup
For horizontal scaling, ensure Redis is configured:

```bash
# Set Redis environment variables
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
SOCKETIO_REDIS_ENABLED=true
```

### Load Balancing
When using multiple server instances, ensure:
1. Redis adapter is enabled
2. Sticky sessions are configured in your load balancer
3. Health checks are properly configured

### Monitoring

Monitor these metrics in production:
- Connection count
- Message throughput
- Memory usage
- Redis connection health
- Error rates

## Security Considerations

1. **Authentication**: Always validate JWT tokens
2. **Rate Limiting**: Configure appropriate limits for your use case
3. **CORS**: Restrict origins to your domains
4. **Input Validation**: All user inputs are validated
5. **Error Handling**: Sensitive information is not exposed

## Troubleshooting

### Common Issues

1. **Connection failures**: Check CORS configuration
2. **Authentication errors**: Verify JWT token validity
3. **Rate limiting**: Adjust limits in environment variables
4. **Memory leaks**: Cleanup tasks run every 5 minutes
5. **Redis issues**: Check Redis connectivity and configuration

### Debugging

Enable debug logging:
```bash
DEBUG=socket.io:* npm run dev
```

## Performance Optimization

1. **Use Redis adapter** for multi-instance deployments
2. **Configure appropriate timeouts** based on your network conditions
3. **Implement message persistence** for message history
4. **Monitor and tune rate limits** based on usage patterns
5. **Use compression** for large payloads

## Future Enhancements

- [ ] Message persistence with MongoDB
- [ ] File upload support for media messages
- [ ] Voice/video calling integration
- [ ] Advanced room permissions
- [ ] Message encryption
- [ ] Push notifications for offline users
- [ ] Advanced analytics and reporting

## Support

For issues or questions, please check:
1. This documentation
2. Socket.IO official documentation
3. Project issues on GitHub