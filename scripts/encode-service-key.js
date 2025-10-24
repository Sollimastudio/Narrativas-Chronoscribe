#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Utilitário para converter um arquivo JSON de credenciais do Google Cloud
 * em uma string Base64. Útil para colar em variáveis de ambiente de serviços
 * como Vercel ou Netlify.
 *
 * Uso:
 *   npm run encode-key -- caminho/para/chave.json
 */

const fs = require("fs");
const path = require("path");

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error(
    "\nUso: npm run encode-key -- caminho/para/arquivo.json\n"
      + "Exemplo: npm run encode-key -- ./chaves/vertex.json\n"
  );
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(absolutePath)) {
  console.error(`\nArquivo não encontrado: ${absolutePath}\n`);
  process.exit(1);
}

try {
  const fileBuffer = fs.readFileSync(absolutePath);
  const base64 = fileBuffer.toString("base64");

  console.log("\n--- STRING BASE64 ---\n");
  console.log(base64);
  console.log(
    "\nCopie o bloco acima e cole na variável GOOGLE_APPLICATION_CREDENTIALS_BASE64 "
      + "no painel da Vercel (ou outro provedor).\n"
  );
} catch (error) {
  console.error(
    `\nFalha ao ler o arquivo: ${
      error instanceof Error ? error.message : String(error)
    }\n`
  );
  process.exit(1);
}
