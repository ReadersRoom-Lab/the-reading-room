import { execFileSync } from "node:child_process";

const dbUrl = process.env.DATABASE_URL || "";
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const isCi = process.env.CI === "true";

if (isVercel && dbUrl && !isCi && !dbUrl.includes("dummy")) {
  console.log("⚡ Syncing database schema to Vercel production Postgres...");
  try {
    const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
    execFileSync(cmd, ["prisma", "db", "push", "--accept-data-loss"], {
      stdio: "inherit",
    });
  } catch (err) {
    console.warn("⚠️ Database schema sync notice:", err.message);
  }
} else {
  console.log("ℹ️ Skipping automatic db push in CI / offline build mode.");
}
