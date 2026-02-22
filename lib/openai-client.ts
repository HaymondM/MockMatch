import OpenAI from 'openai';

/**
 * OpenAI client configuration with error handling and retry logic
 */

// Lazy-loaded OpenAI client instance
let openaiInstance: OpenAI | null = null;

/**
 * Initialize OpenAI client with API key from environment
 */
function initializeOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 seconds timeout
      maxRetries: 0, // We'll handle retries manually for better control
    });
  }
  return openaiInstance;
}

/**
 * Custom error types for OpenAI operations
 */
export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Rate limit errors
  if (error?.status === 429) return true;

  // Timeout errors
  if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED')
    return true;

  // Server errors (5xx)
  if (error?.status >= 500 && error?.status < 600) return true;

  // Network errors
  if (
    error?.code === 'ECONNRESET' ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ECONNREFUSED'
  )
    return true;

  return false;
}

/**
 * Execute OpenAI API call with retry logic and exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'OpenAI operation'
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = isRetryableError(error);

      // Log the error
      console.error(
        `${operationName} failed (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}):`,
        error?.message || error
      );

      // If this is the last attempt or error is not retryable, throw
      if (attempt === RETRY_CONFIG.maxAttempts || !shouldRetry) {
        throw new OpenAIError(
          `${operationName} failed after ${attempt} attempt(s): ${error?.message || 'Unknown error'}`,
          error,
          shouldRetry
        );
      }

      // Wait before retrying with exponential backoff
      const delay = getBackoffDelay(attempt);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new OpenAIError(
    `${operationName} failed after ${RETRY_CONFIG.maxAttempts} attempts`,
    lastError,
    false
  );
}

/**
 * Get the configured OpenAI client
 */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new ValidationError(
      'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
    );
  }
  return initializeOpenAI();
}

/**
 * Export default client getter for convenience
 */
export default getOpenAIClient;
