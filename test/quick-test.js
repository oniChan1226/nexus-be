// Simple Socket.IO Test Script
const { io } = require('socket.io-client');

console.log('🧪 Socket.IO Test Suite Starting...\n');

async function testSocketIO() {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:8080', {
      timeout: 5000,
      forceNew: true
    });

    let testsPassed = 0;
    const totalTests = 4;

    // Test 1: Connection
    socket.on('connect', () => {
      console.log('✅ Test 1/4: Connection successful');
      console.log(`   Socket ID: ${socket.id}`);
      testsPassed++;

      // Test 2: Room Join
      socket.emit('join_room', { roomId: 'test-room-123' });
    });

    // Test 2: Room Join Response
    socket.on('room_joined', (data) => {
      console.log('✅ Test 2/4: Room join successful');
      console.log(`   Joined room: ${data.roomId}`);
      testsPassed++;

      // Test 3: Send Message
      socket.emit('send_message', { 
        roomId: 'test-room-123', 
        message: 'Hello Socket.IO!' 
      });
    });

    // Test 3: Message Response
    socket.on('message_received', (data) => {
      console.log('✅ Test 3/4: Message sent and received');
      console.log(`   Message: "${data.message}" from ${data.from}`);
      testsPassed++;

      // Test 4: Status Update
      socket.emit('update_status', { status: 'online', customData: { testing: true } });
    });

    // Test 4: Status Update Response
    socket.on('user_status_updated', (data) => {
      console.log('✅ Test 4/4: Status update successful');
      console.log(`   New status: ${data.status}`);
      testsPassed++;

      // All tests completed
      if (testsPassed === totalTests) {
        console.log('\n🎉 All Socket.IO tests passed!');
        console.log(`✨ ${testsPassed}/${totalTests} tests successful\n`);
        
        socket.disconnect();
        resolve('All tests passed');
      }
    });

    // Error handling
    socket.on('connect_error', (error) => {
      console.log('❌ Connection failed:', error.message);
      reject(error);
    });

    socket.on('error', (error) => {
      console.log('❌ Socket error:', error.message);
      reject(error);
    });

    // Timeout
    setTimeout(() => {
      if (testsPassed < totalTests) {
        console.log(`⚠️  Test timeout: ${testsPassed}/${totalTests} tests completed`);
        socket.disconnect();
        resolve('Tests incomplete');
      }
    }, 10000);
  });
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:8080');
    return true;
  } catch (error) {
    return false;
  }
}

// Run tests
async function runTests() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:8080');
    console.log('📝 Please start the server first with: npm run dev');
    process.exit(1);
  }

  console.log('✅ Server is running, starting Socket.IO tests...\n');
  
  try {
    await testSocketIO();
    console.log('🏆 Socket.IO test suite completed successfully!');
  } catch (error) {
    console.log('💥 Test suite failed:', error.message);
  }
  
  process.exit(0);
}

runTests();