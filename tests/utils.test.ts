import test from "node:test";
import assert from "node:assert/strict";

import { cn, secureRandom } from "../lib/utils";

test("cn merges class names correctly", () => {
  const result = cn("foo", "bar");
  assert.ok(result.includes("foo"));
  assert.ok(result.includes("bar"));
});

test("cn handles conditional classes with undefined", () => {
  const result = cn("base", undefined, "active");
  assert.ok(result.includes("base"));
  assert.ok(result.includes("active"));
  assert.ok(!result.includes("undefined"));
});

test("cn handles boolean false conditional", () => {
  const isHidden = false;
  const result = cn("base", isHidden && "hidden");
  assert.ok(result.includes("base"));
  assert.ok(!result.includes("hidden"));
});

test("cn merges conflicting Tailwind classes (last wins)", () => {
  const result = cn("p-2", "p-4");
  assert.ok(result.includes("p-4"));
  assert.ok(!result.includes("p-2"));
});

test("cn returns empty string for no arguments", () => {
  const result = cn();
  assert.equal(result, "");
});

test("cn handles array of classes", () => {
  const result = cn(["text-sm", "font-bold"]);
  assert.ok(result.includes("text-sm"));
  assert.ok(result.includes("font-bold"));
});

test("cn handles object syntax from clsx", () => {
  const result = cn({ "text-red-500": true, "text-blue-500": false });
  assert.ok(result.includes("text-red-500"));
  assert.ok(!result.includes("text-blue-500"));
});

test("secureRandom returns numbers in [0, 1) using crypto", () => {
  for (let i = 0; i < 100; i++) {
    const val = secureRandom();
    assert.ok(val >= 0 && val < 1, `Value ${val} should be between 0 and 1`);
  }
});

test("secureRandom falls back to Date.now() when crypto is unavailable", () => {
  // Temporarily remove crypto to hit the fallback branch
  const original = globalThis.crypto;
  // @ts-expect-error: crypto is read-only but deleted for test coverage fallback
  delete globalThis.crypto;
  try {
    const val = secureRandom();
    assert.ok(val >= 0 && val < 1, `Fallback value ${val} should be between 0 and 1`);
  } finally {
    globalThis.crypto = original;
  }
});
