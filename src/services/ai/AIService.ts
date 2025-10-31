// src/services/ai/AIService.ts
import { config } from "../../config/env";
import logger from "../../config/logger";
import {
  AICompletionRequest,
  AICompletionResponse,
  AIProviderType,
} from "../../@types/ai.types";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { AnthropicProvider } from "./providers/AnthropicProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { OllamaProvider } from "./providers/OllamaProvider";

/**
 * Main AI Service - Handles all AI provider interactions
 * Supports: OpenAI, Anthropic, Google Gemini, Ollama
 */
export class AIService {
  private provider: any;
  private providerType: AIProviderType;

  constructor(providerType?: AIProviderType) {
    this.providerType = providerType || config.AI.provider;
    this.initializeProvider();
  }

  private initializeProvider(): void {
    switch (this.providerType) {
      case "openai":
        this.provider = new OpenAIProvider();
        break;
      case "anthropic":
        this.provider = new AnthropicProvider();
        break;
      case "gemini":
        this.provider = new GeminiProvider();
        break;
      case "ollama":
        this.provider = new OllamaProvider();
        break;
      default:
        logger.warn(`Unknown AI provider: ${this.providerType}, defaulting to OpenAI`);
        this.provider = new OpenAIProvider();
    }
    logger.info(`✅ AI Service initialized with ${this.providerType} provider`);
  }

  /**
   * Generate completion from AI
   */
  async generateCompletion(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    try {
      const response = await this.provider.generateCompletion(request);
      logger.info(
        `AI completion generated: ${response.usage?.totalTokens || "N/A"} tokens`
      );
      return response;
    } catch (error) {
      logger.error("AI completion error:", error);
      throw error;
    }
  }

  /**
   * Generate streaming completion
   */
  async *generateStream(request: AICompletionRequest): AsyncGenerator<string> {
    try {
      for await (const chunk of this.provider.generateStream(request)) {
        yield chunk;
      }
    } catch (error) {
      logger.error("AI streaming error:", error);
      throw error;
    }
  }

  /**
   * Quick chat completion helper
   */
  async chat(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: "system" as const, content: systemPrompt });
    }
    
    messages.push({ role: "user" as const, content: userMessage });

    const response = await this.generateCompletion({ messages });
    return response.content;
  }

  /**
   * Quick chat with conversation history
   */
  async chatWithHistory(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<string> {
    const response = await this.generateCompletion({ messages });
    return response.content;
  }

  /**
   * Switch provider dynamically
   */
  switchProvider(providerType: AIProviderType): void {
    this.providerType = providerType;
    this.initializeProvider();
  }

  /**
   * Get current provider info
   */
  getProviderInfo(): { type: AIProviderType; name: string } {
    return {
      type: this.providerType,
      name: this.provider.name,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
