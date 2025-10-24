#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Pipeline de release:
 * 1. Verifica variáveis obrigatórias
 * 2. Roda lint
 * 3. Roda build
 * 4. (Opcional) Deploy via Vercel CLI se houver token/target configurados
 */

const { spawnSync } = require("node:child_process");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} falhou.`);
  }
}

function main() {
  run("node", ["scripts/check-env.js"]);
  run("npm", ["run", "lint"]);
  run("npm", ["run", "build"]);

  if (process.env.VERCEL_DEPLOY !== "1") {
    console.log(
      "✅ Release local concluído (lint + build). "
        + "Defina VERCEL_DEPLOY=1 para disparar deploy automático."
    );
    return;
  }

  if (!process.env.VERCEL_ORG_ID || !process.env.VERCEL_PROJECT_ID) {
    throw new Error(
      "Para deploy automático defina VERCEL_ORG_ID e VERCEL_PROJECT_ID."
    );
  }

  const deployArgs = ["deploy", "--prod", "--yes"];
  run("npx", ["vercel", ...deployArgs], {
    env: {
      ...process.env,
    },
  });
  console.log("🚀 Deploy disparado via Vercel CLI.");
}

try {
  main();
} catch (error) {
  console.error(
    "❌ Release interrompido:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}
