#!/usr/bin/env node
/**
 * Script de validação do setup
 * Verifica se o ambiente está configurado corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando configuração do Narrativas Chronoscribe...\n');

const envPath = path.join(process.cwd(), '.env.local');
const hasEnvFile = fs.existsSync(envPath);

if (!hasEnvFile) {
  console.log('❌ Arquivo .env.local não encontrado');
  console.log('   Execute: npm run setup');
  process.exit(1);
}

// Parse env file
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (!line || line.startsWith('#')) return;
  const [key, ...rest] = line.split('=');
  if (key) env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
});

// Check critical variables
const checks = [
  {
    name: 'AUTH_SECRET ou NEXTAUTH_SECRET',
    check: () => !!(env.AUTH_SECRET || env.NEXTAUTH_SECRET),
    critical: true,
    fix: 'Execute: npm run setup'
  },
  {
    name: 'DATABASE_URL',
    check: () => !!env.DATABASE_URL,
    critical: true,
    fix: 'Execute: npm run setup'
  },
  {
    name: 'OPENAI_API_KEY',
    check: () => !!env.OPENAI_API_KEY,
    critical: false,
    fix: 'Adicione sua chave da OpenAI em .env.local'
  },
  {
    name: 'NEXTAUTH_URL',
    check: () => !!env.NEXTAUTH_URL,
    critical: false,
    fix: 'Defina NEXTAUTH_URL em .env.local (ex: http://localhost:3100)'
  }
];

let allCriticalOk = true;
let warnings = [];

checks.forEach(({ name, check, critical, fix }) => {
  const ok = check();
  const icon = ok ? '✅' : (critical ? '❌' : '⚠️ ');
  console.log(`${icon} ${name}: ${ok ? 'configurado' : 'ausente'}`);
  
  if (!ok) {
    if (critical) {
      allCriticalOk = false;
      console.log(`   Correção: ${fix}`);
    } else {
      warnings.push({ name, fix });
    }
  }
});

console.log('');

if (!allCriticalOk) {
  console.log('❌ Configuração incompleta. Corrija os itens acima.\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  Avisos (funcionalidades opcionais):');
  warnings.forEach(({ name, fix }) => {
    console.log(`   - ${name}: ${fix}`);
  });
  console.log('');
}

console.log('✅ Configuração válida! Você pode executar:');
console.log('   npm run dev    # Iniciar servidor de desenvolvimento');
console.log('   npm run build  # Criar build de produção\n');

process.exit(0);
