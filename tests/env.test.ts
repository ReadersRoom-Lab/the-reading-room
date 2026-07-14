import test from "node:test";
import assert from "node:assert/strict";

import { getEnvVars, createEnv } from "../lib/env";

// ---------------------------------------------------------------------------
// getEnvVars
// ---------------------------------------------------------------------------

test("getEnvVars returns an object", () => {
  const vars = getEnvVars();
  assert.ok(typeof vars === "object" && vars !== null, "should return a non-null object");
});

test("getEnvVars returns the current process.env when process is defined", () => {
  const vars = getEnvVars();
  // At least one well-known Node.js env var must be present
  const hasKnown = "PATH" in vars || "NODE_ENV" in vars || "HOME" in vars || "USERPROFILE" in vars;
  assert.ok(hasKnown, "should expose known Node.js env vars");
});

// ---------------------------------------------------------------------------
// createEnv — happy path (all required vars present)
// ---------------------------------------------------------------------------

test("createEnv returns typed object when all required vars are provided", () => {
  const result = createEnv({
    DATABASE_URL: "postgresql://localhost/test",
    CLERK_SECRET_KEY: "sk_test_abc123",
    GOOGLE_GENERATIVE_AI_API_KEY: "gai_test_key",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_abc123",
    CLERK_WEBHOOK_SECRET: "whsec_test",
  });

  assert.equal(result.DATABASE_URL, "postgresql://localhost/test");
  assert.equal(result.CLERK_SECRET_KEY, "sk_test_abc123");
  assert.equal(result.GOOGLE_GENERATIVE_AI_API_KEY, "gai_test_key");
  assert.equal(result.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, "pk_test_abc123");
  assert.equal(result.CLERK_WEBHOOK_SECRET, "whsec_test");
});

test("createEnv CLERK_WEBHOOK_SECRET is undefined when not provided", () => {
  const result = createEnv({
    DATABASE_URL: "postgresql://localhost/test",
    CLERK_SECRET_KEY: "sk_test",
    GOOGLE_GENERATIVE_AI_API_KEY: "gai_test",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test",
  });

  assert.equal(result.CLERK_WEBHOOK_SECRET, undefined);
});

test("createEnv falls back to empty string for missing DATABASE_URL in build mode", () => {
  const result = createEnv({ CI: "true" });
  assert.equal(result.DATABASE_URL, "");
});

// ---------------------------------------------------------------------------
// createEnv — CI / build mode (should warn, never throw)
// ---------------------------------------------------------------------------

test("createEnv warns and does not throw when CI=true and vars are missing", () => {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (msg: string) => warnings.push(msg);
  try {
    const result = createEnv({ CI: "true" });
    assert.ok(warnings.length > 0, "should emit at least one warning");
    assert.ok(warnings[0].includes("[env]"), "warning should be from [env]");
    assert.ok(warnings[0].includes("Missing"), "warning should mention missing keys");
    assert.equal(result.DATABASE_URL, "", "should fall back to empty string");
  } finally {
    console.warn = original;
  }
});

test("createEnv warns and does not throw when VERCEL=1 and vars are missing", () => {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (msg: string) => warnings.push(msg);
  try {
    createEnv({ VERCEL: "1" });
    assert.ok(warnings.length > 0, "should emit a warning for Vercel build mode");
  } finally {
    console.warn = original;
  }
});

test("createEnv warns and does not throw when SKIP_ENV_VALIDATION=true", () => {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (msg: string) => warnings.push(msg);
  try {
    createEnv({ SKIP_ENV_VALIDATION: "true" });
    assert.ok(warnings.length > 0, "should emit a warning when validation is skipped");
  } finally {
    console.warn = original;
  }
});

// ---------------------------------------------------------------------------
// createEnv — local dev mode (should throw when vars are missing)
// ---------------------------------------------------------------------------

test("createEnv throws when required vars are missing and not in CI/build", () => {
  assert.throws(
    () => createEnv({}),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(
        err.message.includes("Invalid environment variables"),
        `Expected error message to contain 'Invalid environment variables', got: ${err.message}`
      );
      return true;
    }
  );
});

test("createEnv error message lists the missing keys", () => {
  assert.throws(
    () => createEnv({ DATABASE_URL: "postgres://x" }),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(
        err.message.includes("CLERK_SECRET_KEY"),
        "error should mention missing CLERK_SECRET_KEY"
      );
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// env named export — shape validation
// ---------------------------------------------------------------------------

test("env export has all expected keys", async () => {
  // Dynamic import avoids re-executing module-level side effects
  const { env } = await import("../lib/env");
  assert.ok(typeof env === "object" && env !== null, "env should be a non-null object");
  assert.ok("DATABASE_URL" in env, "env should have DATABASE_URL");
  assert.ok("CLERK_SECRET_KEY" in env, "env should have CLERK_SECRET_KEY");
  assert.ok("GOOGLE_GENERATIVE_AI_API_KEY" in env, "env should have GOOGLE_GENERATIVE_AI_API_KEY");
  assert.ok(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" in env,
    "env should have NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  );
  assert.ok("CLERK_WEBHOOK_SECRET" in env, "env should have CLERK_WEBHOOK_SECRET key");
});

test("env values are strings (or undefined for optional CLERK_WEBHOOK_SECRET)", async () => {
  const { env } = await import("../lib/env");
  assert.ok(
    typeof env.DATABASE_URL === "string",
    `DATABASE_URL should be a string, got ${typeof env.DATABASE_URL}`
  );
  assert.ok(
    typeof env.CLERK_SECRET_KEY === "string",
    `CLERK_SECRET_KEY should be a string, got ${typeof env.CLERK_SECRET_KEY}`
  );
  assert.ok(
    typeof env.GOOGLE_GENERATIVE_AI_API_KEY === "string",
    `GOOGLE_GENERATIVE_AI_API_KEY should be a string, got ${typeof env.GOOGLE_GENERATIVE_AI_API_KEY}`
  );
  assert.ok(
    typeof env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string",
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should be a string`
  );
  assert.ok(
    env.CLERK_WEBHOOK_SECRET === undefined || typeof env.CLERK_WEBHOOK_SECRET === "string",
    "CLERK_WEBHOOK_SECRET should be string or undefined"
  );
});
