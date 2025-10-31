#!/usr/bin/env node
// test/comprehensive-socket-test.js
// Comprehensive Socket.IO test script
// Usage: node test/comprehensive-socket-test.js

const io = require('socket.io-client');
const readline = require('readline');

// Configuration
const SOCKET_URL = 'http://localhost:5000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token'; // Replace with actual JWT token

// Colors for console output
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

class SocketTestClient {
  constructor(name, useAuth = false) {
    this.name = name;
    this.useAuth = useAuth;
    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.currentRoom = null;
  }

  connect() {
    log(`🔌 ${this.name}: Connecting to ${SOCKET_URL}...`, colors.cyan);
    
    const options = {
      transports: ['websocket', 'polling'],
      forceNew: true
    };

    if (this.useAuth) {
      options.auth = { token: TEST_TOKEN };
    }

    this.socket = io(SOCKET_URL, options);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection Events
    this.socket.on('connect', () => {
      this.connected = true;
      log(`✅ ${this.name}: Connected with ID: ${this.socket.id}`, colors.green);
    });

    this.socket.on('connected', (data) => {
      log(`🎉 ${this.name}: Welcome message: ${data.message}`, colors.green);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      log(`💔 ${this.name}: Disconnected - ${reason}`, colors.red);
    });

    this.socket.on('connect_error', (error) => {
      log(`🔥 ${this.name}: Connection error: ${error.message}`, colors.red);
    });

    // Authentication Events
    this.socket.on('authentication_success', (data) => {
      this.authenticated = true;
      log(`🔐 ${this.name}: Authenticated as ${data.user?.name || 'Unknown'}`, colors.green);
    });

    // Room Events
    this.socket.on('room_joined', (data) => {
      log(`🏠 ${this.name}: User ${data.userId} joined room ${data.roomId}`, colors.blue);
    });

    this.socket.on('room_left', (data) => {
      log(`🚪 ${this.name}: User ${data.userId} left room ${data.roomId}`, colors.blue);
    });

    this.socket.on('room_message', (message) => {
      log(`💬 ${this.name}: [${message.roomId}] ${message.username}: ${message.content}`, colors.yellow);
    });

    // User Events
    this.socket.on('user_updated', (data) => {
      log(`👤 ${this.name}: User ${data.userId} updated status to ${data.status}`, colors.magenta);
    });

    this.socket.on('user_online', (userId) => {
      log(`🟢 ${this.name}: User ${userId} came online`, colors.green);
    });

    this.socket.on('user_offline', (userId) => {
      log(`🔴 ${this.name}: User ${userId} went offline`, colors.red);
    });

    // Notification Events
    this.socket.on('notification', (notification) => {
      const typeEmoji = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      log(`${typeEmoji[notification.type]} ${this.name}: ${notification.title} - ${notification.message}`, colors.bright);
    });

    // Typing Events
    this.socket.on('typing_start', (data) => {
      log(`⌨️ ${this.name}: ${data.username} is typing in ${data.roomId}...`, colors.cyan);
    });

    this.socket.on('typing_stop', (data) => {
      log(`✋ ${this.name}: ${data.username} stopped typing in ${data.roomId}`, colors.cyan);
    });

    // Error Events
    this.socket.on('error', (error) => {
      log(`❌ ${this.name}: Error - ${error.message}`, colors.red);
    });

    this.socket.on('rate_limit_exceeded', (data) => {
      log(`🚫 ${this.name}: Rate limited! Retry after ${data.retryAfter} seconds`, colors.red);
    });
  }

  // Test Methods
  async testPing() {
    if (!this.connected) return;
    
    log(`📡 ${this.name}: Testing ping...`, colors.cyan);
    this.socket.emit('ping', (response) => {
      log(`🏓 ${this.name}: Pong! Latency: ${Date.now() - response.timestamp}ms`, colors.green);
    });
  }

  async testAuthentication() {
    if (!this.connected) return;
    
    log(`🔐 ${this.name}: Testing authentication...`, colors.cyan);
    this.socket.emit('authenticate', TEST_TOKEN, (response) => {
      if (response.success) {
        log(`✅ ${this.name}: Authentication successful!`, colors.green);
        this.authenticated = true;
      } else {
        log(`❌ ${this.name}: Authentication failed: ${response.error}`, colors.red);
      }
    });
  }

  async testJoinRoom(roomId) {
    if (!this.connected) return;
    
    log(`🏠 ${this.name}: Joining room ${roomId}...`, colors.cyan);
    this.socket.emit('join_room', roomId, (response) => {
      if (response.success) {
        this.currentRoom = roomId;
        log(`✅ ${this.name}: Successfully joined room ${roomId}`, colors.green);
      } else {
        log(`❌ ${this.name}: Failed to join room: ${response.error}`, colors.red);
      }
    });
  }

  async testSendMessage(content) {
    if (!this.connected || !this.currentRoom) return;
    
    log(`💬 ${this.name}: Sending message to ${this.currentRoom}...`, colors.cyan);
    this.socket.emit('send_message', {
      roomId: this.currentRoom,
      content: content,
      type: 'text'
    }, (response) => {
      if (response.success) {
        log(`✅ ${this.name}: Message sent successfully`, colors.green);
      } else {
        log(`❌ ${this.name}: Failed to send message: ${response.error}`, colors.red);
      }
    });
  }

  async testTyping(roomId) {
    if (!this.connected) return;
    
    log(`⌨️ ${this.name}: Starting typing indicator...`, colors.cyan);
    this.socket.emit('typing_start', roomId);
    
    setTimeout(() => {
      log(`✋ ${this.name}: Stopping typing indicator...`, colors.cyan);
      this.socket.emit('typing_stop', roomId);
    }, 3000);
  }

  async testStatusUpdate(status) {
    if (!this.connected) return;
    
    log(`👤 ${this.name}: Updating status to ${status}...`, colors.cyan);
    this.socket.emit('update_status', status);
  }

  disconnect() {
    if (this.socket) {
      log(`🛑 ${this.name}: Disconnecting...`, colors.yellow);
      this.socket.disconnect();
    }
  }
}

// Main test execution
async function runTests() {
  console.log(`${colors.bright}🚀 Starting Socket.IO Comprehensive Tests${colors.reset}\n`);

  // Create test clients
  const client1 = new SocketTestClient('Alice', true);
  const client2 = new SocketTestClient('Bob', true);
  const client3 = new SocketTestClient('Guest', false);

  // Connect all clients
  client1.connect();
  await sleep(1000);
  client2.connect();
  await sleep(1000);
  client3.connect();
  await sleep(2000);

  console.log(`\n${colors.bright}📡 Testing Basic Connectivity${colors.reset}`);
  await client1.testPing();
  await client2.testPing();
  await client3.testPing();
  await sleep(2000);

  console.log(`\n${colors.bright}🔐 Testing Authentication${colors.reset}`);
  await client1.testAuthentication();
  await client2.testAuthentication();
  await sleep(2000);

  console.log(`\n${colors.bright}🏠 Testing Room Management${colors.reset}`);
  await client1.testJoinRoom('test-room');
  await sleep(1000);
  await client2.testJoinRoom('test-room');
  await sleep(1000);
  await client3.testJoinRoom('test-room');
  await sleep(2000);

  console.log(`\n${colors.bright}💬 Testing Messaging${colors.reset}`);
  await client1.testSendMessage('Hello from Alice!');
  await sleep(1000);
  await client2.testSendMessage('Hi Alice, this is Bob!');
  await sleep(1000);
  await client3.testSendMessage('Guest user saying hello!');
  await sleep(2000);

  console.log(`\n${colors.bright}⌨️ Testing Typing Indicators${colors.reset}`);
  await client1.testTyping('test-room');
  await sleep(4000);

  console.log(`\n${colors.bright}👤 Testing User Status${colors.reset}`);
  await client1.testStatusUpdate('busy');
  await sleep(1000);
  await client2.testStatusUpdate('away');
  await sleep(2000);

  console.log(`\n${colors.bright}🚫 Testing Rate Limiting${colors.reset}`);
  log('Sending rapid messages to test rate limiting...', colors.yellow);
  for (let i = 0; i < 10; i++) {
    client1.testSendMessage(`Rapid message ${i + 1}`);
  }
  await sleep(3000);

  console.log(`\n${colors.bright}🎯 All tests completed!${colors.reset}`);
  console.log('\nPress Ctrl+C to exit or wait for auto-cleanup...\n');

  // Auto cleanup after 10 seconds
  setTimeout(() => {
    console.log('🧹 Cleaning up...');
    client1.disconnect();
    client2.disconnect();
    client3.disconnect();
    process.exit(0);
  }, 10000);
}

// Interactive mode
function startInteractiveMode() {
  console.log(`${colors.bright}🎮 Interactive Socket.IO Test Client${colors.reset}\n`);
  
  const client = new SocketTestClient('Interactive-User', true);
  client.connect();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
Available commands:
- ping                    : Test ping
- auth                   : Authenticate
- join <roomId>          : Join a room
- send <message>         : Send message to current room
- status <online|away|busy|offline> : Update status
- typing <roomId>        : Test typing indicator
- quit                   : Exit

`);

  rl.on('line', (input) => {
    const [command, ...args] = input.trim().split(' ');
    const arg = args.join(' ');

    switch (command.toLowerCase()) {
      case 'ping':
        client.testPing();
        break;
      case 'auth':
        client.testAuthentication();
        break;
      case 'join':
        if (arg) client.testJoinRoom(arg);
        else console.log('Usage: join <roomId>');
        break;
      case 'send':
        if (arg) client.testSendMessage(arg);
        else console.log('Usage: send <message>');
        break;
      case 'status':
        if (arg) client.testStatusUpdate(arg);
        else console.log('Usage: status <online|away|busy|offline>');
        break;
      case 'typing':
        if (arg) client.testTyping(arg);
        else console.log('Usage: typing <roomId>');
        break;
      case 'quit':
        client.disconnect();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Unknown command. Type a valid command or "quit" to exit.');
    }
  });
}

// Utility function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Command line argument parsing
const args = process.argv.slice(2);
if (args.includes('--interactive') || args.includes('-i')) {
  startInteractiveMode();
} else {
  runTests();
}

console.log(`${colors.dim}Tip: Use --interactive or -i flag for interactive mode${colors.reset}\n`);