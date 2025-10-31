// src/services/ai/providers/OpenAIProvider.ts
import axios from "axios";
import { config } from "../../../config/env";
import logger from "../../../config/logger";
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../../../@types/ai.types";

export class OpenAIProvider implements AIProvider {
  name = "OpenAI";
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = config.AI.openai.apiKey;
    this.baseUrl = config.AI.openai.baseUrl;
    this.defaultModel = config.AI.openai.defaultModel;

    if (!this.apiKey) {
      logger.warn("⚠️ OpenAI API key not configured");
    }
  }

  async generateCompletion(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: request.model || this.defaultModel,
          messages: request.messages,
          temperature: request.temperature ?? config.AI.defaultTemperature,
          max_tokens: request.maxTokens ?? config.AI.defaultMaxTokens,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const choice = response.data.choices[0];
      return {
        content: choice.message.content,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
        finishReason: choice.finish_reason,
      };
    } catch (error: any) {
      logger.error("OpenAI API error:", error.response?.data || error.message);
      throw new Error(
        `OpenAI API error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  async *generateStream(
    request: AICompletionRequest
  ): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: request.model || this.defaultModel,
          messages: request.messages,
          temperature: request.temperature ?? config.AI.defaultTemperature,
          max_tokens: request.maxTokens ?? config.AI.defaultMaxTokens,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
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
          if (line.includes("[DONE]")) continue;
          if (!line.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(line.substring(6));
            const content = json.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error: any) {
      logger.error("OpenAI streaming error:", error.message);
      throw new Error(`OpenAI streaming error: ${error.message}`);
    }
  }
}
