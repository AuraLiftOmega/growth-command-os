import { toast } from "sonner";

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ApiError {
  status: number;
  message: string;
  retryable: boolean;
}

// Parse and categorize API errors
export function parseApiError(error: unknown): ApiError {
  if (error instanceof Response) {
    return {
      status: error.status,
      message: getErrorMessage(error.status),
      retryable: isRetryable(error.status),
    };
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        retryable: true,
      };
    }

    // Timeout
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        status: 408,
        message: 'Request timed out. Please try again.',
        retryable: true,
      };
    }

    // Parse HTTP status from error message
    const statusMatch = error.message.match(/HTTP (\d{3})/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      return {
        status,
        message: getErrorMessage(status),
        retryable: isRetryable(status),
      };
    }

    return {
      status: 500,
      message: error.message,
      retryable: true,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
    retryable: true,
  };
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 402:
      return 'Usage limit reached. Please add credits to continue.';
    case 403:
      return 'Access denied. You don\'t have permission.';
    case 404:
      return 'Resource not found.';
    case 429:
      return 'Too many requests. Please wait a moment.';
    case 500:
      return 'Server error. Our team has been notified.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Retrying...';
    default:
      return `Request failed (${status})`;
  }
}

function isRetryable(status: number): boolean {
  // Retry server errors and rate limits
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

// Show appropriate toast based on error
export function showErrorToast(error: unknown, context?: string): void {
  const parsed = parseApiError(error);
  const prefix = context ? `${context}: ` : '';

  if (parsed.status === 429) {
    toast.warning(`${prefix}Rate limited. Please wait...`, {
      duration: 5000,
    });
  } else if (parsed.status === 402) {
    toast.error(`${prefix}Usage limit reached`, {
      description: 'Add credits to continue using AI features.',
      action: {
        label: 'Add Credits',
        onClick: () => window.open('/settings', '_blank'),
      },
    });
  } else if (parsed.retryable) {
    toast.error(`${prefix}${parsed.message}`, {
      description: 'Retrying automatically...',
    });
  } else {
    toast.error(`${prefix}${parsed.message}`);
  }
}

// Determine error severity for logging/alerting
export function getErrorSeverity(error: unknown): ErrorSeverity {
  const parsed = parseApiError(error);

  if (parsed.status === 0 || parsed.status >= 500) {
    return 'high';
  }
  if (parsed.status === 429 || parsed.status === 408) {
    return 'medium';
  }
  if (parsed.status >= 400) {
    return 'low';
  }
  return 'medium';
}

// Log error with context
export function logError(
  error: unknown,
  context: string,
  metadata?: Record<string, unknown>
): void {
  const parsed = parseApiError(error);
  const severity = getErrorSeverity(error);

  console.error(`[${severity.toUpperCase()}] ${context}:`, {
    status: parsed.status,
    message: parsed.message,
    retryable: parsed.retryable,
    ...metadata,
  });

  // In production, send to error tracking service
  // e.g., Sentry, LogRocket, etc.
}

// Self-healing: automatic retry with backoff
export async function selfHealingFetch<T>(
  url: string,
  options: RequestInit = {},
  config: {
    maxRetries?: number;
    baseDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, onRetry } = config;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, waitMs));
        onRetry?.(attempt + 1);
        continue;
      }

      if (!response.ok) {
        throw response;
      }

      return await response.json();
    } catch (error) {
      const parsed = parseApiError(error);

      if (!parsed.retryable || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
      onRetry?.(attempt + 1);
    }
  }

  throw new Error('All retry attempts exhausted');
}
