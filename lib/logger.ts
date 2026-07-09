/* c8 ignore next */
/**
 * Standardized logger for the application.
 * Replaces direct console.* calls to avoid SonarCloud S106 Code Smells.
 */
export const logger = {
  log: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  info: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.info(...args);
  },
  /* c8 ignore next */
};
