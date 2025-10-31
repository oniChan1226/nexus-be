# 🤖 AI Routes - Hackathon Ready Template

## Overview

This AI module provides a flexible, provider-agnostic interface for LLM integrations. Perfect for hackathons where you might want to switch between different AI providers or use local models.

**Supported Providers:**
- ✅ **OpenAI** (GPT-4, GPT-3.5, GPT-4o, etc.)
- ✅ **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus, etc.)
- ✅ **Google Gemini** (Gemini 1.5 Pro, Gemini 1.5 Flash)
- ✅ **Ollama** (Local LLMs - Llama 2, Mistral, etc.)

---

## 🚀 Quick Setup

### 1. Add Environment Variables

Add to your `.env` file:

```env
# AI Provider Configuration
AI_PROVIDER=openai  # Options: openai, anthropic, gemini, ollama

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_BASE_URL=https://api.anthropic.com

# Google Gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash

# Ollama (Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# AI Settings
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
```

### 2. Install Required Package (Already included: axios)

The module uses `axios` which is already in your dependencies. No additional packages needed!

### 3. Test the API

```bash
# Simple chat
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! What can you help me with?"
  }'

# Get provider info
curl http://localhost:8080/api/ai/provider
```

---

## 📋 API Endpoints

### 1. Simple Chat

**POST** `/api/ai/chat`

```json
{
  "message": "Explain quantum computing in simple terms",
  "systemPrompt": "You are a helpful science teacher",
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 500
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Chat completion successful",
  "data": {
    "message": "Quantum computing is...",
    "model": "gpt-4o-mini",
    "usage": {
      "promptTokens": 25,
      "completionTokens": 150,
      "totalTokens": 175
    }
  }
}
```

### 2. Chat with History

**POST** `/api/ai/chat/history`

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a coding assistant"
    },
    {
      "role": "user",
      "content": "How do I create a REST API?"
    },
    {
      "role": "assistant",
      "content": "Here's how to create a REST API..."
    },
    {
      "role": "user",
      "content": "Can you show me an example with Express?"
    }
  ],
  "temperature": 0.5
}
```

### 3. Streaming Chat

**POST** `/api/ai/chat/stream`

Returns Server-Sent Events (SSE) for real-time streaming:

```json
{
  "message": "Write a short story about a robot",
  "temperature": 0.9,
  "maxTokens": 500
}
```

**Frontend Example:**
```javascript
const eventSource = new EventSource('/api/ai/chat/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.chunk) {
    console.log(data.chunk); // Stream chunks
  }
};
```

### 4. Text Analysis

**POST** `/api/ai/analyze`

```json
{
  "text": "I absolutely loved this product! Best purchase ever!",
  "task": "sentiment analysis"
}
```

**Other task examples:**
- "extract key points"
- "summarize"
- "identify named entities"
- "classify topic"

### 5. Text Generation

**POST** `/api/ai/generate`

```json
{
  "prompt": "A futuristic city with flying cars",
  "task": "creative writing",
  "format": "3 paragraphs",
  "temperature": 0.8
}
```

### 6. Get Provider Info

**GET** `/api/ai/provider`

```json
{
  "statusCode": 200,
  "message": "Provider info retrieved",
  "data": {
    "type": "openai",
    "name": "OpenAI"
  }
}
```

### 7. Switch Provider

**POST** `/api/ai/provider`

```json
{
  "provider": "anthropic"  // or "openai", "gemini", "ollama"
}
```

---

## 🎯 Hackathon Use Cases

### 1. **Chatbot**
```javascript
// Simple chatbot endpoint
app.post('/chatbot', async (req, res) => {
  const response = await fetch('http://localhost:8080/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: req.body.userMessage,
      systemPrompt: "You are a friendly customer service bot"
    })
  });
  const data = await response.json();
  res.json({ reply: data.data.message });
});
```

### 2. **Content Generator**
```javascript
// Blog post generator
const generateBlogPost = async (topic) => {
  const response = await fetch('http://localhost:8080/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Write a blog post about ${topic}`,
      format: "markdown with headings",
      maxTokens: 1000
    })
  });
  return await response.json();
};
```

### 3. **Sentiment Analysis Tool**
```javascript
// Analyze customer reviews
const analyzeSentiment = async (review) => {
  const response = await fetch('http://localhost:8080/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: review,
      task: "sentiment analysis with score (-1 to 1)"
    })
  });
  return await response.json();
};
```

### 4. **Code Assistant**
```javascript
// Code explanation or generation
const codeHelper = async (code, question) => {
  const response = await fetch('http://localhost:8080/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: "You are an expert programmer",
      message: `Code:\n\`\`\`\n${code}\n\`\`\`\n\nQuestion: ${question}`
    })
  });
  return await response.json();
};
```

### 5. **Data Extraction**
```javascript
// Extract structured data from text
const extractData = async (text) => {
  const response = await fetch('http://localhost:8080/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text,
      task: "extract names, dates, and locations as JSON"
    })
  });
  return await response.json();
};
```

---

## 🔧 Using Different Providers

### OpenAI (Recommended for hackathons)
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # Fast and cheap!
```

**Pros:** Fast, reliable, great quality  
**Cons:** Requires API key, costs money  
**Best for:** Production-ready hackathon projects

### Anthropic Claude
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Pros:** Long context, excellent reasoning  
**Cons:** Slightly slower, requires API key  
**Best for:** Complex analysis, long documents

### Google Gemini
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash
```

**Pros:** Free tier available, fast  
**Cons:** Newer API, less documentation  
**Best for:** Budget-friendly hackathons

### Ollama (Local LLMs)
```bash
# Install Ollama first: https://ollama.ai
ollama pull llama2
ollama serve
```

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Pros:** 100% free, no API keys, offline  
**Cons:** Slower, requires local setup  
**Best for:** Privacy-focused, offline demos

---

## 💡 Advanced Features

### Switch Providers Dynamically

```javascript
// Switch to Ollama for free tier
await fetch('http://localhost:8080/api/ai/provider', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'ollama' })
});

// Now all AI calls use Ollama
```

### Custom System Prompts

```javascript
const systemPrompts = {
  translator: "You are a professional translator. Translate accurately.",
  teacher: "You are a patient teacher. Explain concepts clearly.",
  coder: "You are an expert programmer. Write clean, efficient code.",
  creative: "You are a creative writer. Be imaginative and engaging."
};

// Use different personas
const response = await fetch('http://localhost:8080/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    systemPrompt: systemPrompts.teacher,
    message: "Explain recursion"
  })
});
```

### Temperature Control

```javascript
// Creative writing (high temperature)
{ temperature: 0.9, message: "Write a creative story" }

// Factual answers (low temperature)
{ temperature: 0.1, message: "What is the capital of France?" }

// Balanced (medium temperature)
{ temperature: 0.5, message: "Explain machine learning" }
```

---

## 🎨 Frontend Integration Examples

### React Hook

```jsx
import { useState } from 'react';

function useAI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const chat = async (message) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      setResponse(data.data.message);
    } finally {
      setLoading(false);
    }
  };

  return { chat, loading, response };
}
```

### Vue Composable

```javascript
import { ref } from 'vue';

export function useAI() {
  const loading = ref(false);
  const response = ref('');

  const chat = async (message) => {
    loading.value = true;
    try {
      const res = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      response.value = data.data.message;
    } finally {
      loading.value = false;
    }
  };

  return { chat, loading, response };
}
```

---

## 🚀 Quick Test

```bash
# 1. Set your API key
export OPENAI_API_KEY=sk-...

# 2. Start server
npm run dev

# 3. Test chat
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! Tell me a joke."}'

# 4. Check provider
curl http://localhost:8080/api/ai/provider
```

---

## 📝 Notes

- **Free Options:** Use Gemini (has free tier) or Ollama (completely free, local)
- **Fast Development:** OpenAI GPT-4o-mini is fast and cheap ($0.15/1M tokens)
- **No API Key?** Use Ollama with local models (llama2, mistral, etc.)
- **Streaming:** Use `/chat/stream` for real-time responses in your UI
- **Rate Limiting:** Consider adding rate limiting for production use

---

## 🎯 Hackathon Tips

1. **Start with OpenAI** for reliability, switch to Ollama if budget runs out
2. **Use streaming** for better UX in chat interfaces
3. **Cache responses** to save API costs
4. **Lower temperature** (0.1-0.3) for factual tasks
5. **Higher temperature** (0.7-0.9) for creative tasks
6. **Test with different providers** to find best quality/cost balance

Your AI routes are ready to use! Perfect for any hackathon project involving LLMs. 🚀
