// src/services/ai/providers/AnthropicProvider.ts
import axios from "axios";
import { config } from "../../../config/env";
import logger from "../../../config/logger";
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../../../@types/ai.types";

export class AnthropicProvider implements AIProvider {
  name = "Anthropic Claude";
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = config.AI.anthropic.apiKey;
    this.baseUrl = config.AI.anthropic.baseUrl;
    this.defaultModel = config.AI.anthropic.defaultModel;

    if (!this.apiKey) {
      logger.warn("⚠️ Anthropic API key not configured");
    }
  }

  async generateCompletion(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    try {
      // Separate system message from other messages
      const systemMessage = request.messages.find((m) => m.role === "system");
      const messages = request.messages.filter((m) => m.role !== "system");

      const response = await axios.post(
        `${this.baseUrl}/v1/messages`,
        {
          model: request.model || this.defaultModel,
          messages: messages,
          ...(systemMessage && { system: systemMessage.content }),
          temperature: request.temperature ?? config.AI.defaultTemperature,
          max_tokens: request.maxTokens ?? config.AI.defaultMaxTokens,
        },
        {
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
        }
      );

      return {
        content: response.data.content[0].text,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens:
            response.data.usage.input_tokens +
            response.data.usage.output_tokens,
        },
        finishReason: response.data.stop_reason,
      };
    } catch (error: any) {
      logger.error("Anthropic API error:", error.response?.data || error.message);
      throw new Error(
        `Anthropic API error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  async *generateStream(
    request: AICompletionRequest
  ): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    try {
      const systemMessage = request.messages.find((m) => m.role === "system");
      const messages = request.messages.filter((m) => m.role !== "system");

      const response = await axios.post(
        `${this.baseUrl}/v1/messages`,
        {
          model: request.model || this.defaultModel,
          messages: messages,
          ...(systemMessage && { system: systemMessage.content }),
          temperature: request.temperature ?? config.AI.defaultTemperature,
          max_tokens: request.maxTokens ?? config.AI.defaultMaxTokens,
          stream: true,
        },
        {
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          responseType: "stream",
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line: string) => line.trim() !== "");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(line.substring(6));
            if (json.type === "content_block_delta") {
              const content = json.delta?.text;
              if (content) {
                yield content;
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error: any) {
      logger.error("Anthropic streaming error:", error.message);
      throw new Error(`Anthropic streaming error: ${error.message}`);
    }
  }
}
