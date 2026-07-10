/**
 * Environment variable validation using Zod.
 * Import this in server-side API routes to get typed, validated env vars.
 *
 * Design:
 *  - `getEnvVars()` – pure function, safe to call anywhere.
 *  - `createEnv(raw)` – validates a raw record; throws in local dev when vars
 *    are missing, warns in CI/build (CI=true | VERCEL=1 | SKIP_ENV_VALIDATION=true).
 *  - `env` named export – module-level convenience object; warns but never
 *    throws so tests can safely import this module without a live .env file.
 */
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

/** Safely read env — works in both Node.js (server) and Edge/browser contexts. */
export function getEnvVars(): Record<string, string | undefined> {
  if (typeof process !== "undefined" && process.env) {
    return process.env as Record<string, string | undefined>;
  }
  return {};
}

/**
 * Validate a raw env record and return a typed env object.
 *
 * - In local development (no CI/build flags): throws when required vars are missing.
 * - In CI/build environments (CI=true | VERCEL=1 | SKIP_ENV_VALIDATION=true):
 *   warns via console.warn and returns an object with empty-string fallbacks.
 */
export function createEnv(raw: Record<string, string | undefined>) {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const missingKeys = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    const isBuild =
      raw["CI"] === "true" || raw["VERCEL"] === "1" || raw["SKIP_ENV_VALIDATION"] === "true";

    if (isBuild) {
      console.warn(`⚠️ [env] Missing variables in CI/build environment: [${missingKeys}]`);
    } else {
      throw new Error(
        `❌ Invalid environment variables. Missing: [${missingKeys}]. ` +
          `Please check your .env.local file.`
      );
    }
  }

  return {
    DATABASE_URL: raw["DATABASE_URL"] ?? "",
    CLERK_SECRET_KEY: raw["CLERK_SECRET_KEY"] ?? "",
    GOOGLE_GENERATIVE_AI_API_KEY: raw["GOOGLE_GENERATIVE_AI_API_KEY"] ?? "",
    CLERK_WEBHOOK_SECRET: raw["CLERK_WEBHOOK_SECRET"],
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: raw["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "",
  };
}

/**
 * Module-level env export — reads process.env at startup.
 * Warns when variables are missing but never throws, so that:
 *  - Unit tests can import this module without a live .env file.
 *  - CI builds succeed without real secrets being present.
 */
const rawEnv = getEnvVars();
const moduleValidation = envSchema.safeParse(rawEnv);
if (!moduleValidation.success) {
  const missingKeys = moduleValidation.error.issues.map((i) => i.path.join(".")).join(", ");
  console.warn(`⚠️ [env] Running with missing environment variables: [${missingKeys}]`);
}

export const env = {
  DATABASE_URL: rawEnv["DATABASE_URL"] ?? "",
  CLERK_SECRET_KEY: rawEnv["CLERK_SECRET_KEY"] ?? "",
  GOOGLE_GENERATIVE_AI_API_KEY: rawEnv["GOOGLE_GENERATIVE_AI_API_KEY"] ?? "",
  CLERK_WEBHOOK_SECRET: rawEnv["CLERK_WEBHOOK_SECRET"],
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: rawEnv["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "",
};
