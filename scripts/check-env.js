#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const POSSIBLE_ENV_FILES = [".env.local", "env.local"];

for (const file of POSSIBLE_ENV_FILES) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    if (!key) continue;
    if (!process.env[key]) {
      process.env[key] = rest.join("=").trim().replace(/^"|"$/g, "");
    }
  }
}

const isProd = process.env.NODE_ENV === "production";

// Regras alinhadas com src/config/env.ts
const missingAuth = !(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
const missingOpenAI = !process.env.OPENAI_API_KEY;
const missingNextAuthUrl = !process.env.NEXTAUTH_URL;
const missingDb = !process.env.DATABASE_URL; // em dev, default sqlite cobre
const missingGcs = !(
  process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_STORAGE_BUCKET
);

const hardMissing = [];
if (missingAuth) hardMissing.push("AUTH_SECRET/NEXTAUTH_SECRET");
if (missingOpenAI) hardMissing.push("OPENAI_API_KEY");
if (missingNextAuthUrl) hardMissing.push("NEXTAUTH_URL");
if (isProd && missingDb) hardMissing.push("DATABASE_URL");
if (isProd && missingGcs) hardMissing.push("GOOGLE_CLOUD_PROJECT/GOOGLE_STORAGE_BUCKET");

if (hardMissing.length) {
  console.error("❌ Variáveis obrigatórias ausentes:");
  console.error("  ", hardMissing.join(", "));
  process.exit(1);
}

// Avisos não bloqueantes em dev
if (!isProd) {
  const warnings = [];
  if (missingDb) warnings.push("DATABASE_URL ausente (usando default sqlite)");
  if (missingGcs)
    warnings.push("Google Cloud Storage incompleto (upload cairá no fallback local se falhar)");
  if (warnings.length) {
    console.warn("⚠️  Avisos:");
    for (const w of warnings) console.warn("  -", w);
  }
}

console.log("✅ Variáveis principais ok.");
