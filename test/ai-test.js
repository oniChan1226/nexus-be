// test/ai-test.js
// Quick test script for AI routes
// Run with: node test/ai-test.js

const API_URL = 'http://localhost:8080/api/ai';

async function testAIRoutes() {
  console.log('🤖 Testing AI Routes...\n');

  // Test 1: Get Provider Info
  console.log('1️⃣ Testing GET /api/ai/provider');
  try {
    const response = await fetch(`${API_URL}/provider`);
    const data = await response.json();
    console.log('✅ Provider:', data.data);
    console.log();
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log();
  }

  // Test 2: Simple Chat
  console.log('2️⃣ Testing POST /api/ai/chat');
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Say hello in 5 words or less',
        temperature: 0.7
      })
    });
    const data = await response.json();
    console.log('✅ Response:', data.data?.message || data.message);
    if (data.data?.usage) {
      console.log('📊 Tokens used:', data.data.usage.totalTokens);
    }
    console.log();
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log();
  }

  // Test 3: Text Analysis
  console.log('3️⃣ Testing POST /api/ai/analyze');
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'This is an amazing product! I love it!',
        task: 'sentiment analysis'
      })
    });
    const data = await response.json();
    console.log('✅ Analysis:', data.data?.result || data.message);
    console.log();
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log();
  }

  // Test 4: Text Generation
  console.log('4️⃣ Testing POST /api/ai/generate');
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Write a haiku about coding',
        task: 'creative writing',
        temperature: 0.8,
        maxTokens: 100
      })
    });
    const data = await response.json();
    console.log('✅ Generated:');
    console.log(data.data?.content || data.message);
    console.log();
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log();
  }

  // Test 5: Chat with History
  console.log('5️⃣ Testing POST /api/ai/chat/history');
  try {
    const response = await fetch(`${API_URL}/chat/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is 2+2?' },
          { role: 'assistant', content: '2+2 equals 4.' },
          { role: 'user', content: 'What about 2+3?' }
        ]
      })
    });
    const data = await response.json();
    console.log('✅ Response:', data.data?.message || data.message);
    console.log();
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log();
  }

  console.log('✨ All tests completed!\n');
  console.log('💡 Tips:');
  console.log('- Set OPENAI_API_KEY or another provider API key in .env');
  console.log('- Change AI_PROVIDER in .env to switch providers');
  console.log('- Use Ollama for free local testing (no API key needed)');
}

// Run tests
testAIRoutes().catch(console.error);
