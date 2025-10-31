// src/modules/ai/ai.route.ts
import { Router } from "express";
import {
  chat,
  chatWithHistory,
  chatStream,
  analyze,
  generate,
  getProviderInfo,
  switchProvider,
} from "./ai.controller";

const router = Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Simple chat completion
 * @body    { message, systemPrompt?, model?, temperature?, maxTokens? }
 */
router.post("/chat", chat);

/**
 * @route   POST /api/ai/chat/history
 * @desc    Chat with conversation history
 * @body    { messages: [{ role, content }], model?, temperature?, maxTokens? }
 */
router.post("/chat/history", chatWithHistory);

/**
 * @route   POST /api/ai/chat/stream
 * @desc    Streaming chat completion (SSE)
 * @body    { message, systemPrompt?, model?, temperature?, maxTokens? }
 */
router.post("/chat/stream", chatStream);

/**
 * @route   POST /api/ai/analyze
 * @desc    Analyze text (sentiment, extraction, summarization, etc.)
 * @body    { text, task, model? }
 */
router.post("/analyze", analyze);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate text based on prompt
 * @body    { prompt, task?, format?, model?, temperature?, maxTokens? }
 */
router.post("/generate", generate);

/**
 * @route   GET /api/ai/provider
 * @desc    Get current AI provider info
 */
router.get("/provider", getProviderInfo);

/**
 * @route   POST /api/ai/provider
 * @desc    Switch AI provider
 * @body    { provider: "openai" | "anthropic" | "gemini" | "ollama" }
 */
router.post("/provider", switchProvider);

export default router;
