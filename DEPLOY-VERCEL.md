# 🚀 Guia de Deploy na Vercel

## ✅ Pré-requisitos

Antes de fazer deploy na Vercel, você precisa:

1. **Conta na Vercel** - https://vercel.com (pode usar GitHub)
2. **Banco de dados PostgreSQL** - Recomendado: Vercel Postgres, Supabase ou Neon
3. **Chave OpenAI** - https://platform.openai.com/api-keys

---

## 📋 Passo a Passo Completo

### 1. Preparar o Banco de Dados PostgreSQL

**Opção A: Vercel Postgres (Recomendado)**
1. No dashboard da Vercel, vá em **Storage** > **Create Database**
2. Escolha **Postgres**
3. Copie a `DATABASE_URL` (formato: `postgres://...`)

**Opção B: Supabase (Grátis)**
1. Acesse https://supabase.com
2. Crie um projeto
3. Vá em **Settings** > **Database**
4. Copie a **Connection String** (modo "Transaction")
5. Formato: `postgresql://postgres:[password]@[host]:5432/postgres`

**Opção C: Neon (Grátis)**
1. Acesse https://neon.tech
2. Crie um projeto
3. Copie a connection string

### 2. Obter Chave OpenAI

1. Acesse https://platform.openai.com/api-keys
2. Clique em **Create new secret key**
3. Dê um nome (ex: "Narrativas Chronoscribe")
4. Copie a chave (começa com `sk-proj-...`)
5. **IMPORTANTE:** Salve em local seguro - só aparece uma vez!

### 3. Gerar AUTH_SECRET

No seu terminal local:

```bash
openssl rand -base64 32
```

Copie o resultado (será algo como: `XyZ123abc...`)

### 4. Configurar Variáveis na Vercel

1. Acesse o dashboard da Vercel
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**

Adicione estas variáveis:

```bash
# Obrigatórias
AUTH_SECRET=cole_aqui_o_resultado_do_openssl
NEXTAUTH_SECRET=mesmo_valor_do_AUTH_SECRET
DATABASE_URL=sua_url_postgresql_completa
NEXTAUTH_URL=https://seu-app.vercel.app
OPENAI_API_KEY=sk-proj-sua-chave-openai

# Modelo OpenAI (opcional, padrão: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Plano padrão (opcional, padrão: free)
DEFAULT_PLAN_SLUG=free
```

**⚠️ IMPORTANTE:**
- Marque todas como **Production**, **Preview** e **Development**
- Não coloque espaços antes/depois do `=`
- A `NEXTAUTH_URL` deve ser a URL **exata** do seu app na Vercel

### 5. Deploy

**Opção A: Deploy via Git (Recomendado)**

1. Conecte seu repositório GitHub à Vercel
2. A cada push, deploy automático acontecerá
3. Aguarde o build completar

**Opção B: Deploy via CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 6. Sincronizar Banco de Dados (IMPORTANTE!)

Após o primeiro deploy com sucesso:

```bash
# No seu terminal local, com DATABASE_URL apontando para produção
npx prisma db push

# Ou via Vercel CLI
vercel env pull .env.production.local
npx prisma db push
```

### 7. Popular Planos (Opcional mas Recomendado)

Se quiser os planos padrão (free/creator/scale):

```bash
# Localmente, apontando para prod
node scripts/seed-plans.js
```

### 8. Verificar Deploy

Acesse:
```
https://seu-app.vercel.app/api/health
```

Deve retornar:
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
    }
  },
  "capabilities": {
    "generateContent": true,
    "authentication": true
  }
}
```

---

## 🔧 Troubleshooting - Erros Comuns

### Erro: "Build failed" (npm run build)

**Causa:** Variáveis de ambiente não configuradas corretamente.

**Solução:**
1. Verifique se **TODAS** as variáveis obrigatórias estão na Vercel
2. Verifique se não há espaços extras
3. Vá em **Deployments** > último deploy > **...** > **Redeploy**

### Erro: "NEXTAUTH_URL missing"

**Causa:** Variável `NEXTAUTH_URL` não configurada.

**Solução:**
```bash
# Na Vercel, adicione:
NEXTAUTH_URL=https://seu-app-real.vercel.app
```

**⚠️ IMPORTANTE:** Use a URL **EXATA** do seu app (copie da barra de endereço)

### Erro: "Database connection failed"

**Causa:** `DATABASE_URL` incorreta ou banco não acessível.

**Solução:**
1. Verifique se a `DATABASE_URL` está correta
2. Para Vercel Postgres: certifique-se que está no formato correto
3. Para Supabase/Neon: verifique se o modo de conexão está correto
4. Teste localmente primeiro:
   ```bash
   # .env.local
   DATABASE_URL="sua_url_de_producao"
   npx prisma db push
   ```

### Erro: "Prisma Client initialization failed"

**Causa:** Schema do banco não sincronizado.

**Solução:**
```bash
# Conecte-se ao banco de produção
DATABASE_URL="sua_url_prod" npx prisma db push

# Ou via Vercel
vercel env pull
npx prisma db push
```

### Erro: "OpenAI API authentication failed"

**Causa:** `OPENAI_API_KEY` inválida ou expirada.

**Solução:**
1. Verifique se copiou a chave completa (começa com `sk-proj-`)
2. Teste localmente:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer sua-chave-aqui"
   ```
3. Se falhar, gere nova chave em https://platform.openai.com/api-keys

### Aviso: "[next-auth][warn][NEXTAUTH_URL]"

**Causa:** `NEXTAUTH_URL` não definida ou incorreta.

**Solução:**
```bash
# Adicione na Vercel, exatamente assim:
NEXTAUTH_URL=https://seu-app.vercel.app

# SEM barra no final!
# Correto:   https://meu-app.vercel.app
# Incorreto: https://meu-app.vercel.app/
```

### Deploy fica em loop / nunca completa

**Causa:** Geralmente erro de build ou timeout.

**Solução:**
1. Vá em **Deployments** > clique no deploy falhado
2. Leia o log completo para encontrar o erro exato
3. Erros comuns:
   - Falta variável de ambiente
   - Erro de TypeScript
   - Timeout (aumentar em Settings > Functions)

---

## 📝 Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Build local funciona: `npm run build` ✅
- [ ] Todas as variáveis de ambiente configuradas na Vercel
- [ ] `NEXTAUTH_URL` com a URL correta do app
- [ ] `DATABASE_URL` de um PostgreSQL acessível
- [ ] `OPENAI_API_KEY` válida e testada
- [ ] `AUTH_SECRET` gerado com `openssl rand -base64 32`
- [ ] Repositório conectado à Vercel
- [ ] Branch correta selecionada (main ou master)

---

## 🎯 Variáveis de Ambiente - Resumo

### Obrigatórias em Produção:

```bash
AUTH_SECRET=resultado_do_openssl_rand
NEXTAUTH_SECRET=mesmo_do_AUTH_SECRET
DATABASE_URL=postgresql://usuario:senha@host:5432/db
NEXTAUTH_URL=https://seu-app.vercel.app
OPENAI_API_KEY=sk-proj-sua-chave-completa
```

### Opcionais (mas recomendadas):

```bash
OPENAI_MODEL=gpt-4o-mini
DEFAULT_PLAN_SLUG=free
NODE_ENV=production  # Vercel define automaticamente
```

### NÃO necessárias (Google Cloud é opcional):

```bash
# Estas NÃO são obrigatórias:
# GOOGLE_CLOUD_PROJECT=...
# GOOGLE_STORAGE_BUCKET=...
# GOOGLE_APPLICATION_CREDENTIALS=...
```

---

## 🆘 Ainda Não Funciona?

1. **Capture o log de erro:**
   - Vá em **Deployments** > clique no deploy falhado
   - Role até encontrar o erro em vermelho
   - Copie a mensagem completa

2. **Verifique o /api/health:**
   - Acesse `https://seu-app.vercel.app/api/health`
   - Veja quais serviços estão com problema

3. **Teste build local com variáveis de produção:**
   ```bash
   # Crie .env.production.local com as mesmas variáveis da Vercel
   npm run build
   ```

4. **Cole o erro em um comentário:**
   - Inclua o log completo do build
   - Inclua a resposta de `/api/health` (se acessível)
   - Mencione quais variáveis você configurou

---

## ✅ Deploy Bem-Sucedido

Se tudo estiver correto, você verá:

1. **Build verde** no dashboard da Vercel ✅
2. **Página inicial** carrega sem erros ✅
3. **`/api/health`** retorna status "ok" ✅
4. **Login/Register** funcionando ✅
5. **Geração de conteúdo** ativa (mode: "real") ✅

**Primeira vez após deploy?**
1. Acesse `https://seu-app.vercel.app/register`
2. Crie sua primeira conta
3. Faça login
4. Teste gerar conteúdo!

---

## 📚 Documentos Relacionados

- `VARIAVEIS-AMBIENTE.md` - Detalhes de cada variável
- `TROUBLESHOOTING.md` - Problemas locais
- `RESUMO-CORRECOES.md` - O que foi corrigido neste PR

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Postgres:** https://vercel.com/docs/storage/vercel-postgres
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **Supabase:** https://supabase.com
- **Neon:** https://neon.tech
- **NextAuth Docs:** https://next-auth.js.org/configuration/options
