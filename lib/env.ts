import { z } from "zod";

declare const process: { env: Record<string, string | undefined> };

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is missing"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is missing"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "GOOGLE_GENERATIVE_AI_API_KEY is missing"),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

const isServer = globalThis.window === undefined;
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "true" ||
  process.env.CI === "true" ||
  process.env.VERCEL === "1";

let parsedEnv: z.infer<typeof envSchema>;

if (isServer) {
  const result = envSchema.safeParse(process.env);
  if (result.success) {
    parsedEnv = result.data;
  } else {
    const missingKeys = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    if (skipValidation) {
      console.warn(`⚠️ Warning: Missing environment variables in CI/build: [${missingKeys}]`);
      parsedEnv = {
        DATABASE_URL: process.env.DATABASE_URL || "",
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
        GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
        CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || "",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
      };
    } else {
      throw new Error(
        `❌ Invalid environment variables. Missing keys: [${missingKeys}]. Please check your local .env configuration.`
      );
    }
  }
} else {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    if (skipValidation) {
      console.warn(
        `⚠️ Warning: Missing client-side publishable key in CI/build: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
      );
    } else {
      throw new Error(`❌ Missing client-side publishable key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`);
    }
  }
  parsedEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
    DATABASE_URL: "",
    CLERK_SECRET_KEY: "",
    GOOGLE_GENERATIVE_AI_API_KEY: "",
  };
}

export const env = parsedEnv;
