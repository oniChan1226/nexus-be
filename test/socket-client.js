// test/socket-client.js
// Simple Socket.IO test client
// Run with: node test/socket-client.js

const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:5000';

// Create socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  auth: {
    // Add your JWT token here if testing with authentication
    // token: 'your-jwt-token'
  }
});

console.log('🔌 Connecting to Socket.IO server...');

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  // Test ping
  socket.emit('ping', (response) => {
    console.log('📡 Ping response:', response);
  });
  
  // Test joining a room
  socket.emit('join_room', 'test-room', (response) => {
    console.log('🏠 Join room response:', response);
    
    if (response.success) {
      // Send a test message
      socket.emit('send_message', {
        roomId: 'test-room',
        content: 'Hello from test client!',
        type: 'text'
      }, (response) => {
        console.log('💬 Send message response:', response);
      });
    }
  });
});

socket.on('connected', (data) => {
  console.log('🎉 Welcome message:', data);
});

socket.on('room_joined', (data) => {
  console.log('🏠 Room joined:', data);
});

socket.on('room_message', (message) => {
  console.log('💬 Received message:', message);
});

socket.on('notification', (notification) => {
  console.log('🔔 Notification:', notification);
});

socket.on('error', (error) => {
  console.log('❌ Socket error:', error);
});

socket.on('rate_limit_exceeded', (data) => {
  console.log('🚫 Rate limit exceeded:', data);
});

socket.on('disconnect', (reason) => {
  console.log('💔 Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('🔥 Connection error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

console.log('Press Ctrl+C to disconnect');