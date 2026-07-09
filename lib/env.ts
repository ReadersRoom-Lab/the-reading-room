/**
 * Environment variable validation using Zod.
 * Import this in server-side API routes to get typed, validated env vars.
 * This module is safe to import during build time — it will warn in CI
 * but never throw, preventing build failures due to missing secrets.
 */
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

// Safely read env — works in both Node.js (server) and Edge/browser contexts
function getEnvVars(): Record<string, string | undefined> {
  if (typeof process !== "undefined" && process.env) {
    return process.env as Record<string, string | undefined>;
  }
  return {};
}

const raw = getEnvVars();
const result = envSchema.safeParse(raw);

if (!result.success) {
  const missingKeys = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  // In CI/build environments, warn instead of crashing
  // CI=true is set automatically by GitHub Actions; VERCEL=1 is set by Vercel
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

export const env = {
  DATABASE_URL: raw["DATABASE_URL"] ?? "",
  CLERK_SECRET_KEY: raw["CLERK_SECRET_KEY"] ?? "",
  GOOGLE_GENERATIVE_AI_API_KEY: raw["GOOGLE_GENERATIVE_AI_API_KEY"] ?? "",
  CLERK_WEBHOOK_SECRET: raw["CLERK_WEBHOOK_SECRET"],
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: raw["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "",
};
