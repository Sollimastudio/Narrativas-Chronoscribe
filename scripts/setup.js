#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script de configuração rápida:
 * - Garante que exista um arquivo .env.local
 * - Gera AUTH_SECRET se estiver vazio
 * - Define DATABASE_URL padrão (SQLite) se estiver vazio
 * - Sincroniza o schema Prisma com o banco informado
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const crypto = require("crypto");

const ENV_PATH = path.join(process.cwd(), ".env.local");

function ensureEnvFile() {
  if (fs.existsSync(ENV_PATH)) return;

  const template = [
    "# === Variáveis básicas ===",
    "OPENAI_API_KEY=",
    "OPENAI_MODEL=gpt-4o-mini",
    "# OPENAI_BASE_URL=https://api.openai.com/v1",
    "",
    "# Será preenchido automaticamente se vazio",
    "AUTH_SECRET=",
    'DATABASE_URL="file:./prisma/dev.db"',
    "",
  ].join("\n");

  fs.writeFileSync(ENV_PATH, template, { encoding: "utf8" });
  console.log("• Arquivo .env.local criado.");
}

function parseEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return {};

  return fs
    .readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      if (!line || line.trim().startsWith("#")) return acc;
      const [key, ...rest] = line.split("=");
      acc[key.trim()] = rest.join("=").trim();
      return acc;
    }, {});
}

function upsertEnv(key, value) {
  let content = fs.readFileSync(ENV_PATH, "utf8");
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    if (!content.endsWith("\n")) content += "\n";
    content += `${key}=${value}\n`;
  }

  fs.writeFileSync(ENV_PATH, content, { encoding: "utf8" });
}

function ensureAuthSecret(env) {
  if (env.AUTH_SECRET) {
    console.log("• AUTH_SECRET já definido.");
    return;
  }

  const secret = crypto.randomBytes(32).toString("base64");
  upsertEnv("AUTH_SECRET", secret);
  console.log("• AUTH_SECRET gerado automaticamente.");
}

function ensureDatabaseUrl(env) {
  if (env.DATABASE_URL) {
    console.log(`• DATABASE_URL já definido (${env.DATABASE_URL}).`);
    return env.DATABASE_URL;
  }

  const defaultUrl = '"file:./prisma/dev.db"';
  upsertEnv("DATABASE_URL", defaultUrl);
  console.log(`• DATABASE_URL definido para ${defaultUrl}.`);
  return defaultUrl;
}

function prismaSync(env) {
  const dbUrl = (env.DATABASE_URL || '"file:./prisma/dev.db"').replace(/^"|"$/g, "");

  if (dbUrl.includes("USER:PASSWORD@HOST")) {
    console.log(
      "• DATABASE_URL parece placeholder. Pule o prisma db push automático."
    );
    return;
  }

  console.log("• Sincronizando schema Prisma …");

  const result = spawnSync("npx", ["prisma", "db", "push"], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
  });

  if (result.status !== 0) {
    throw new Error("Prisma db push falhou. Veja o log acima.");
  }
}

function main() {
  ensureEnvFile();
  let env = parseEnvFile();
  ensureAuthSecret(env);
  env = parseEnvFile();
  ensureDatabaseUrl(env);
  env = parseEnvFile();
  prismaSync(env);
  console.log("✅ Setup concluído. Revise .env.local e continue com npm run dev.");
}

try {
  main();
} catch (error) {
  console.error("❌ Falha no setup:", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
