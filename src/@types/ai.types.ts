// src/@types/ai.types.ts

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIProvider {
  name: string;
  generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;
  generateStream(request: AICompletionRequest): AsyncGenerator<string>;
}

export type AIProviderType = "openai" | "anthropic" | "gemini" | "ollama";

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}
