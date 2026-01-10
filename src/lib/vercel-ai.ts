import { supabase } from "@/integrations/supabase/client";

export interface VercelAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface VercelAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  tool_choice?: any;
}

export interface VercelAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: any[];
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Available models via Vercel AI Gateway
export const VERCEL_AI_MODELS = {
  // OpenAI models
  "gpt-4o": "GPT-4o - Latest multimodal model",
  "gpt-4o-mini": "GPT-4o Mini - Fast and efficient",
  "gpt-4-turbo": "GPT-4 Turbo - High capability",
  "gpt-3.5-turbo": "GPT-3.5 Turbo - Fast and cheap",
  
  // Anthropic models
  "claude-3-5-sonnet": "Claude 3.5 Sonnet - Balanced performance",
  "claude-3-opus": "Claude 3 Opus - Most capable",
  "claude-3-haiku": "Claude 3 Haiku - Fastest",
  
  // Google models
  "gemini-1.5-pro": "Gemini 1.5 Pro - Advanced reasoning",
  "gemini-1.5-flash": "Gemini 1.5 Flash - Fast inference",
  
  // Open source models
  "llama-3.1-70b": "Llama 3.1 70B - Open source",
  "mixtral-8x7b": "Mixtral 8x7B - MoE model",
} as const;

export type VercelAIModel = keyof typeof VERCEL_AI_MODELS;

/**
 * Call Vercel AI Gateway for chat completions
 */
export async function callVercelAI(
  messages: VercelAIMessage[],
  options: VercelAIOptions = {}
): Promise<VercelAIResponse> {
  const {
    model = "gpt-4o",
    temperature = 0.7,
    max_tokens = 4096,
    stream = false,
    tools,
    tool_choice,
  } = options;

  const { data, error } = await supabase.functions.invoke("vercel-ai-gateway", {
    body: {
      messages,
      model,
      temperature,
      max_tokens,
      stream,
      tools,
      tool_choice,
    },
  });

  if (error) {
    console.error("[Vercel AI] Function error:", error);
    throw new Error(error.message || "Failed to call Vercel AI");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as VercelAIResponse;
}

/**
 * Stream chat completions from Vercel AI Gateway
 */
export async function streamVercelAI(
  messages: VercelAIMessage[],
  options: Omit<VercelAIOptions, "stream"> & {
    onDelta: (text: string) => void;
    onDone: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  const { onDelta, onDone, onError, ...aiOptions } = options;
  
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vercel-ai-gateway`;

  try {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages,
        stream: true,
        ...aiOptions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Incomplete JSON, wait for more data
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    onDone();
  } catch (error) {
    console.error("[Vercel AI] Stream error:", error);
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } else {
      throw error;
    }
  }
}

/**
 * Simple chat helper - single message, single response
 */
export async function chatWithVercelAI(
  userMessage: string,
  systemPrompt?: string,
  model: VercelAIModel = "gpt-4o"
): Promise<string> {
  const messages: VercelAIMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  messages.push({ role: "user", content: userMessage });

  const response = await callVercelAI(messages, { model });
  
  return response.choices[0]?.message?.content || "";
}

/**
 * Extract structured data using tool calling
 */
export async function extractWithVercelAI<T>(
  prompt: string,
  schema: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  },
  model: VercelAIModel = "gpt-4o"
): Promise<T | null> {
  const response = await callVercelAI(
    [{ role: "user", content: prompt }],
    {
      model,
      tools: [
        {
          type: "function",
          function: schema,
        },
      ],
      tool_choice: { type: "function", function: { name: schema.name } },
    }
  );

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    try {
      return JSON.parse(toolCall.function.arguments) as T;
    } catch {
      console.error("[Vercel AI] Failed to parse tool call arguments");
      return null;
    }
  }

  return null;
}
