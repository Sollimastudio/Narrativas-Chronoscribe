#!/usr/bin/env node

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

const optionalMissing = OPTIONAL_AT_LEAST_ONE.filter(
  (group) => !group.some((key) => process.env[key])
);

if (missing.length || optionalMissing.length) {
  console.error("❌ Variáveis de ambiente ausentes:");
  if (missing.length) {
    console.error("  Obrigatórias:", missing.join(", "));
  }
  if (optionalMissing.length) {
    for (const group of optionalMissing) {
      console.error(`  Pelo menos uma deve estar definida: ${group.join(" / ")}`);
    }
  }
  process.exit(1);
}

console.log("✅ Variáveis de ambiente principais encontradas.");
