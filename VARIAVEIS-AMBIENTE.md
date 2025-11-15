# Variáveis de Ambiente — Narrativas Chronoscribe

## ✅ Resumo Rápido

### Obrigatórias em PRODUÇÃO
- `AUTH_SECRET` ou `NEXTAUTH_SECRET` — Chave secreta para autenticação
- `DATABASE_URL` — URL do banco de dados PostgreSQL
- `NEXTAUTH_URL` — URL completa do app (ex: https://seuapp.vercel.app)
- `OPENAI_API_KEY` — Chave da API OpenAI para geração de conteúdo

### Opcionais (mas recomendadas)
- `OPENAI_MODEL` — Modelo a usar (padrão: `gpt-4o-mini`)
- `GOOGLE_CLOUD_PROJECT` — ID do projeto no Google Cloud
- `GOOGLE_STORAGE_BUCKET` — Nome do bucket para upload de arquivos
- `GOOGLE_APPLICATION_CREDENTIALS_BASE64` — Credenciais GCS em base64

### Desenvolvimento Local
- Em desenvolvimento, apenas `AUTH_SECRET` e `DATABASE_URL` são obrigatórias
- Sem `OPENAI_API_KEY`, o app avisa mas não trava
- Sem Google Cloud, uploads vão para `public/uploads/` localmente

---

## 📋 Variáveis Detalhadas

### Autenticação

```bash
# Obrigatória - Gere com: openssl rand -base64 32
AUTH_SECRET=sua_chave_secreta_aqui

# Obrigatória em produção - URL completa do app
NEXTAUTH_URL=https://seu-dominio.com
```

### Banco de Dados

```bash
# Obrigatória - PostgreSQL em produção, SQLite em dev
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Desenvolvimento com SQLite (padrão)
DATABASE_URL="file:./prisma/dev.db"
```

### OpenAI (Geração de Conteúdo)

```bash
# Obrigatória em produção - Pegue em https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxx

# Opcional - Modelo a usar (padrão: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Opcional - URL customizada (para proxies ou outros providers)
# OPENAI_BASE_URL=https://api.openai.com/v1
```

### Google Cloud Storage (Upload de Arquivos)

```bash
# OPCIONAL - Se configurado, uploads vão para GCS
GOOGLE_CLOUD_PROJECT=seu-projeto-id
GOOGLE_STORAGE_BUCKET=seu-bucket-name

# OPCIONAL - Credenciais em base64 (recomendado para Vercel)
GOOGLE_APPLICATION_CREDENTIALS_BASE64=base64_encoded_json

# OPCIONAL - Caminho para arquivo JSON local
# GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/credentials.json
```

**Nota:** Sem Google Cloud configurado:
- Em desenvolvimento: uploads vão para `public/uploads/`
- Em produção: upload de arquivos não estará disponível

### Redis (Cache - Opcional)

```bash
# OPCIONAL - Para cache de análises
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Ou conexão tradicional
# REDIS_URL=redis://...
```

### Analytics (Opcional)

```bash
# OPCIONAL - APIs externas para análise de mercado
SEMRUSH_API_KEY=...
SEMRUSH_ENDPOINT=https://api.semrush.com

GOOGLE_TRENDS_API_KEY=...

AHREFS_API_KEY=...
AHREFS_ENDPOINT=https://api.ahrefs.com/v1
```

---

## 🚀 Configuração Rápida

### 1. Desenvolvimento Local (Mínimo)

```bash
# .env.local
AUTH_SECRET=cole_aqui_resultado_do_openssl_rand_-base64_32
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY=sk-proj-sua-chave-openai
```

Execute:
```bash
npm run setup  # Cria .env.local se não existir e gera AUTH_SECRET
npm run dev    # Inicia em http://localhost:3100
```

### 2. Produção (Vercel)

No dashboard da Vercel, adicione:
```
AUTH_SECRET=gere_uma_chave_secreta
NEXTAUTH_URL=https://seu-app.vercel.app
DATABASE_URL=postgresql://...sua-url-postgres...
OPENAI_API_KEY=sk-proj-...
```

Opcionalmente, adicione Google Cloud:
```
GOOGLE_CLOUD_PROJECT=seu-projeto
GOOGLE_STORAGE_BUCKET=seu-bucket
GOOGLE_APPLICATION_CREDENTIALS_BASE64=...
```

---

## 🔍 Verificar Configuração

Após configurar as variáveis, acesse:
```
http://localhost:3100/api/health
```

Ou em produção:
```
https://seu-app.vercel.app/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "mode": "real",
  "services": {
    "openai": {
      "configured": true,
      "status": "ok"
    },
    "auth": {
      "configured": true,
      "status": "ok"
    },
    "database": {
      "configured": true,
      "status": "ok"
    },
    "storage": {
      "configured": false,
      "status": "optional"
    }
  },
  "capabilities": {
    "generateContent": true,
    "authentication": true,
    "uploadFiles": false
  }
}
```

---

## ❓ Troubleshooting

### "Variáveis obrigatórias ausentes"
- **Desenvolvimento:** Apenas `AUTH_SECRET` e `DATABASE_URL` são críticas
- **Produção:** Precisa também de `NEXTAUTH_URL` e `OPENAI_API_KEY`

### "Google Cloud Storage não configurado"
- **É normal!** Google Cloud é opcional
- Uploads vão para `public/uploads/` em dev
- Em produção sem GCS, upload de arquivos não funciona

### "OPENAI_API_KEY não configurada"
- App funciona mas não gera conteúdo real
- Configure a chave em https://platform.openai.com/api-keys
- Copie a chave completa começando com `sk-proj-`

### Build falha na Vercel
- Verifique se todas as variáveis obrigatórias estão no dashboard
- `AUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `OPENAI_API_KEY`
- Build não precisa de valores reais, mas precisa das variáveis definidas

---

## 📝 Exemplo Completo (.env.local)

```bash
# === Autenticação ===
AUTH_SECRET=gere_com_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3100

# === Banco de Dados ===
DATABASE_URL="file:./prisma/dev.db"

# === OpenAI ===
OPENAI_API_KEY=sk-proj-sua-chave-aqui
OPENAI_MODEL=gpt-4o-mini

# === Google Cloud (Opcional) ===
# GOOGLE_CLOUD_PROJECT=meu-projeto
# GOOGLE_STORAGE_BUCKET=meu-bucket
# GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# === Redis (Opcional) ===
# UPSTASH_REDIS_REST_URL=https://...
# UPSTASH_REDIS_REST_TOKEN=...

# === Plano Padrão (Opcional) ===
# DEFAULT_PLAN_SLUG=free
```
