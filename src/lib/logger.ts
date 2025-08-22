// Conditional logging utility for production safety

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Debug logging - only shows in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logging - shows in development, limited in production
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logging - always shows but sanitized in production
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    } else {
      // In production, only show the first argument to avoid data leaks
      console.warn('[WARN]', args[0]);
    }
  },

  /**
   * Error logging - always shows but sanitized in production
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, only show the first argument to avoid data leaks
      console.error('[ERROR]', args[0]);
    }
  },

  /**
   * Performance logging - only in development
   */
  perf: (label: string, fn: () => void) => {
    if (isDevelopment) {
      console.time(label);
      fn();
      console.timeEnd(label);
    } else {
      fn();
    }
  }
};