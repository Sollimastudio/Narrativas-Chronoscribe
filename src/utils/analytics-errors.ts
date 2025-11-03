export class AnalyticsError extends Error {
  constructor(
    public readonly service: string,
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }

  static fromApiError(service: string, error: unknown): AnalyticsError {
    if (error instanceof Response) {
      return new AnalyticsError(
        service,
        `${error.status}`,
        `API error: ${error.statusText}`
      );
    }

    if (error instanceof Error) {
      return new AnalyticsError(
        service,
        'UNKNOWN',
        error.message,
        error
      );
    }

    return new AnalyticsError(
      service,
      'UNKNOWN',
      'Unknown error occurred'
    );
  }

  static isRateLimitError(error: unknown): boolean {
    return (
      error instanceof AnalyticsError &&
      (error.code === '429' || error.code === 'RATE_LIMIT')
    );
  }

  static isAuthError(error: unknown): boolean {
    return (
      error instanceof AnalyticsError &&
      (error.code === '401' || error.code === '403')
    );
  }
}

export class RetryStrategy {
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_DELAY = 1000; // 1 second

  static async retry<T>(
    operation: () => Promise<T>,
    service: string
  ): Promise<T> {
    let lastError: unknown;
    let delay = this.INITIAL_DELAY;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt)) {
          throw AnalyticsError.fromApiError(service, error);
        }

        await this.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }

    throw AnalyticsError.fromApiError(service, lastError);
  }

  private static shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.MAX_RETRIES) return false;
    
    // Retry on rate limit errors
    if (AnalyticsError.isRateLimitError(error)) return true;

    // Retry on network errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('network') || 
             message.includes('timeout') ||
             message.includes('connection');
    }

    return false;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function withErrorHandling<T>(
  operation: () => Promise<T>,
  service: string,
  fallback: T
): Promise<T> {
  return RetryStrategy.retry(operation, service)
    .catch(error => {
      console.error(`${service} error:`, error);
      return fallback;
    });
}
