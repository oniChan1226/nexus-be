// src/services/ai/providers/GeminiProvider.ts
import axios from "axios";
import { config } from "../../../config/env";
import logger from "../../../config/logger";
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../../../@types/ai.types";

export class GeminiProvider implements AIProvider {
  name = "Google Gemini";
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = config.AI.gemini.apiKey;
    this.defaultModel = config.AI.gemini.defaultModel;

    if (!this.apiKey) {
      logger.warn("⚠️ Google Gemini API key not configured");
    }
  }

  async generateCompletion(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error("Google Gemini API key not configured");
    }

    try {
      const model = request.model || this.defaultModel;
      
      // Convert messages to Gemini format
      const contents = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      // Add system instruction if exists
      const systemMessage = request.messages.find((m) => m.role === "system");

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        {
          contents,
          ...(systemMessage && {
            systemInstruction: {
              parts: [{ text: systemMessage.content }],
            },
          }),
          generationConfig: {
            temperature: request.temperature ?? config.AI.defaultTemperature,
            maxOutputTokens: request.maxTokens ?? config.AI.defaultMaxTokens,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const candidate = response.data.candidates[0];
      const content = candidate.content.parts[0].text;

      return {
        content,
        model,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
          completionTokens:
            response.data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.data.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: candidate.finishReason,
      };
    } catch (error: any) {
      logger.error("Gemini API error:", error.response?.data || error.message);
      throw new Error(
        `Gemini API error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  async *generateStream(
    request: AICompletionRequest
  ): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error("Google Gemini API key not configured");
    }

    try {
      const model = request.model || this.defaultModel;

      const contents = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const systemMessage = request.messages.find((m) => m.role === "system");

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
        {
          contents,
          ...(systemMessage && {
            systemInstruction: {
              parts: [{ text: systemMessage.content }],
            },
          }),
          generationConfig: {
            temperature: request.temperature ?? config.AI.defaultTemperature,
            maxOutputTokens: request.maxTokens ?? config.AI.defaultMaxTokens,
          },
        },
        {
          headers: {
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
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield text;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error: any) {
      logger.error("Gemini streaming error:", error.message);
      throw new Error(`Gemini streaming error: ${error.message}`);
    }
  }
}
