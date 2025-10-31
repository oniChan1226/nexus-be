// src/modules/ai/ai.controller.ts
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { aiService } from "../../services/ai/AIService";
import logger from "../../config/logger";

/**
 * AI Controller - Handles AI/LLM interactions
 * Supports multiple providers: OpenAI, Anthropic, Gemini, Ollama
 */

/**
 * Simple chat completion
 */
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { message, systemPrompt, model, temperature, maxTokens } = req.body;

  if (!message) {
    return res.status(400).json(
      new ApiResponse(400, "Message is required", null)
    );
  }

  try {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: "system" as const, content: systemPrompt });
    }
    
    messages.push({ role: "user" as const, content: message });

    const response = await aiService.generateCompletion({
      messages,
      model,
      temperature,
      maxTokens,
    });

    logger.info(`Chat completion: ${response.usage?.totalTokens || 0} tokens`);

    res.status(200).json(
      new ApiResponse(200, "Chat completion successful", {
        message: response.content,
        model: response.model,
        usage: response.usage,
      })
    );
  } catch (error: any) {
    logger.error("Chat completion error:", error);
    res.status(500).json(
      new ApiResponse(500, error.message || "AI service error", null)
    );
  }
});

/**
 * Chat with conversation history
 */
export const chatWithHistory = asyncHandler(async (req: Request, res: Response) => {
  const { messages, model, temperature, maxTokens } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json(
      new ApiResponse(400, "Messages array is required", null)
    );
  }

  try {
    const response = await aiService.generateCompletion({
      messages,
      model,
      temperature,
      maxTokens,
    });

    logger.info(`Chat with history: ${response.usage?.totalTokens || 0} tokens`);

    res.status(200).json(
      new ApiResponse(200, "Chat completion successful", {
        message: response.content,
        model: response.model,
        usage: response.usage,
      })
    );
  } catch (error: any) {
    logger.error("Chat with history error:", error);
    res.status(500).json(
      new ApiResponse(500, error.message || "AI service error", null)
    );
  }
});

/**
 * Streaming chat completion
 */
export const chatStream = asyncHandler(async (req: Request, res: Response) => {
  const { message, systemPrompt, model, temperature, maxTokens } = req.body;

  if (!message) {
    return res.status(400).json(
      new ApiResponse(400, "Message is required", null)
    );
  }

  try {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: "system" as const, content: systemPrompt });
    }
    
    messages.push({ role: "user" as const, content: message });

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    logger.info("Starting streaming chat completion");

    for await (const chunk of aiService.generateStream({
      messages,
      model,
      temperature,
      maxTokens,
    })) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    logger.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * Text analysis/extraction
 */
export const analyze = asyncHandler(async (req: Request, res: Response) => {
  const { text, task, model } = req.body;

  if (!text || !task) {
    return res.status(400).json(
      new ApiResponse(400, "Text and task are required", null)
    );
  }

  try {
    const systemPrompt = `You are a helpful assistant that performs text analysis tasks. 
Current task: ${task}
Provide clear, structured output.`;

    const response = await aiService.chat(text, systemPrompt);

    logger.info(`Text analysis completed: ${task}`);

    res.status(200).json(
      new ApiResponse(200, "Analysis completed", {
        result: response,
        task,
      })
    );
  } catch (error: any) {
    logger.error("Analysis error:", error);
    res.status(500).json(
      new ApiResponse(500, error.message || "Analysis failed", null)
    );
  }
});

/**
 * Text generation/completion
 */
export const generate = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, task, format, model, temperature, maxTokens } = req.body;

  if (!prompt) {
    return res.status(400).json(
      new ApiResponse(400, "Prompt is required", null)
    );
  }

  try {
    let systemPrompt = "You are a helpful AI assistant.";
    
    if (task) {
      systemPrompt += ` Task: ${task}`;
    }
    
    if (format) {
      systemPrompt += ` Output format: ${format}`;
    }

    const response = await aiService.generateCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model,
      temperature,
      maxTokens,
    });

    logger.info(`Text generation completed`);

    res.status(200).json(
      new ApiResponse(200, "Generation successful", {
        content: response.content,
        model: response.model,
        usage: response.usage,
      })
    );
  } catch (error: any) {
    logger.error("Generation error:", error);
    res.status(500).json(
      new ApiResponse(500, error.message || "Generation failed", null)
    );
  }
});

/**
 * Get AI provider info
 */
export const getProviderInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    const info = aiService.getProviderInfo();
    
    res.status(200).json(
      new ApiResponse(200, "Provider info retrieved", info)
    );
  } catch (error: any) {
    logger.error("Get provider info error:", error);
    res.status(500).json(
      new ApiResponse(500, error.message || "Failed to get provider info", null)
    );
  }
});

/**
 * Switch AI provider
 */
export const switchProvider = asyncHandler(async (req: Request, res: Response) => {
  const { provider } = req.body;

  if (!provider || !["openai", "anthropic", "gemini", "ollama"].includes(provider)) {
    return res.status(400).json(
      new ApiResponse(400, "Valid provider is required (openai, anthropic, gemini, ollama)", null)
    );
  }

  try {
    aiService.switchProvider(provider);
    const info = aiService.getProviderInfo();

    logger.info(`Switched to ${provider} provider`);

    res.status(200).json(
      new ApiResponse(200, `Switched to ${provider}`, info)
    );
  } catch (error: any) {
    logger.error("Switch provider error:", error);
    res.status(500).json(
      new ApiResponse(500, error.message || "Failed to switch provider", null)
    );
  }
});
