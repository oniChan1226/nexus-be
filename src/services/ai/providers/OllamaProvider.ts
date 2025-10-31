// src/services/ai/providers/OllamaProvider.ts
import axios from "axios";
import { config } from "../../../config/env";
import logger from "../../../config/logger";
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "../../../@types/ai.types";

export class OllamaProvider implements AIProvider {
  name = "Ollama (Local)";
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = config.AI.ollama.baseUrl;
    this.defaultModel = config.AI.ollama.defaultModel;
  }

  async generateCompletion(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: request.model || this.defaultModel,
          messages: request.messages,
          stream: false,
          options: {
            temperature: request.temperature ?? config.AI.defaultTemperature,
            num_predict: request.maxTokens ?? config.AI.defaultMaxTokens,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        content: response.data.message.content,
        model: response.data.model,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens:
            (response.data.prompt_eval_count || 0) +
            (response.data.eval_count || 0),
        },
        finishReason: response.data.done ? "stop" : "length",
      };
    } catch (error: any) {
      logger.error("Ollama API error:", error.message);
      throw new Error(
        `Ollama API error: ${error.message}. Make sure Ollama is running locally.`
      );
    }
  }

  async *generateStream(
    request: AICompletionRequest
  ): AsyncGenerator<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: request.model || this.defaultModel,
          messages: request.messages,
          stream: true,
          options: {
            temperature: request.temperature ?? config.AI.defaultTemperature,
            num_predict: request.maxTokens ?? config.AI.defaultMaxTokens,
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
          try {
            const json = JSON.parse(line);
            const content = json.message?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error: any) {
      logger.error("Ollama streaming error:", error.message);
      throw new Error(`Ollama streaming error: ${error.message}`);
    }
  }
}
