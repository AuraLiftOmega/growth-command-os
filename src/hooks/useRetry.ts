import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

export function useRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    maxRetries = DEFAULT_OPTIONS.maxRetries,
    delayMs = DEFAULT_OPTIONS.delayMs,
    backoffMultiplier = DEFAULT_OPTIONS.backoffMultiplier,
    onRetry,
  } = options;

  const execute = useCallback(async (): Promise<T | null> => {
    abortControllerRef.current = new AbortController();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      try {
        if (attempt > 0) {
          setState(prev => ({ ...prev, isRetrying: true, retryCount: attempt }));
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          onRetry?.(attempt, lastError!);
        }

        const result = await operation();
        setState({ isRetrying: false, retryCount: 0, lastError: null });
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt === maxRetries) {
          setState({ isRetrying: false, retryCount: attempt, lastError });
          toast.error(`Operation failed after ${maxRetries + 1} attempts`);
        }
      }
    }

    return null;
  }, [operation, maxRetries, delayMs, backoffMultiplier, onRetry]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(prev => ({ ...prev, isRetrying: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ isRetrying: false, retryCount: 0, lastError: null });
  }, []);

  return {
    execute,
    cancel,
    reset,
    ...state,
  };
}

// API request wrapper with automatic retry
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries + 1})...`);
      }

      const response = await fetch(url, options);

      // Handle rate limits with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delayMs * Math.pow(backoffMultiplier, attempt);
        console.warn(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (except rate limits)
      if (lastError.message.includes('HTTP 4') && !lastError.message.includes('429')) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

// Graceful degradation helper
export function withFallback<T>(
  promise: Promise<T>,
  fallback: T,
  onError?: (error: Error) => void
): Promise<T> {
  return promise.catch((error) => {
    console.error('Operation failed, using fallback:', error);
    onError?.(error instanceof Error ? error : new Error(String(error)));
    return fallback;
  });
}
