import { z } from "zod";

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

let parsedEnv: z.infer<typeof envSchema> & Record<string, string>;

if (isServer) {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missingKeys = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(
      `❌ Invalid environment variables. Missing keys: [${missingKeys}]. Please check your local .env configuration.`
    );
  }
  parsedEnv = result.data as unknown as z.infer<typeof envSchema> & Record<string, string>;
} else {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    throw new Error(`❌ Missing client-side publishable key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`);
  }
  parsedEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  } as unknown as z.infer<typeof envSchema> & Record<string, string>;
}

export const env = parsedEnv;
