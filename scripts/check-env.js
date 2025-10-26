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

const REQUIRED_VARS = [
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_CLOUD_LOCATION",
  "GEMINI_MODEL",
  "AUTH_SECRET",
  "DATABASE_URL",
];

const OPTIONAL_AT_LEAST_ONE = [
  ["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_APPLICATION_CREDENTIALS_BASE64"],
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

const placeholderDb =
  process.env.DATABASE_URL &&
  /USER:PASSWORD@HOST/i.test(process.env.DATABASE_URL);

const optionalMissing = OPTIONAL_AT_LEAST_ONE.filter(
  (group) => !group.some((key) => process.env[key])
);

if (missing.length || optionalMissing.length || placeholderDb) {
  console.error("❌ Variáveis de ambiente ausentes:");
  if (missing.length) {
    console.error("  Obrigatórias:", missing.join(", "));
  }
  if (optionalMissing.length) {
    for (const group of optionalMissing) {
      console.error(`  Pelo menos uma deve estar definida: ${group.join(" / ")}`);
    }
  }
  if (placeholderDb) {
    console.error(
      "  DATABASE_URL parece estar com valores padrão (USER:PASSWORD@HOST). Atualize com sua string real."
    );
  }
  process.exit(1);
}

console.log("✅ Variáveis de ambiente principais encontradas.");
