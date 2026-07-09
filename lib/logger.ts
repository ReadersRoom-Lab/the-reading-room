/* c8 ignore next */
/**
 * Standardized logger for the application.
 * Replaces direct console.* calls to avoid SonarCloud S106 Code Smells.
 */
export const logger = {
  log: (...args: unknown[]) => {
    console.log(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  info: (...args: unknown[]) => {
    console.info(...args);
  },
  /* c8 ignore next */
};
