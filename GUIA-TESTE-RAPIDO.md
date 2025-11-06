# 🚀 Guia de Teste Rápido - Narrativas Chronoscribe

## ✅ Status Atual do Projeto

**BUILD: COMPILANDO COM SUCESSO** ✅  
**PROBLEMAS CORRIGIDOS:**
- ✅ Tailwind CSS v4 configurado corretamente
- ✅ ESLint configurado e funcional
- ✅ TypeScript compilando sem erros
- ✅ Google Cloud Storage tornado opcional
- ✅ Next.js 15 compatibilidade corrigida

---

## 📋 Pré-requisitos Obrigatórios

### 1. Ferramentas Necessárias
- **Node.js** versão 18 ou superior
- **PostgreSQL** ou **SQLite** (desenvolvimento)
- **Git** instalado

### 2. Chaves de API Necessárias

| Serviço | Obrigatório? | Como Obter |
|---------|--------------|------------|
| **OpenAI API** | ✅ SIM | https://platform.openai.com/api-keys |
| **Google Cloud** | ❌ Opcional | https://console.cloud.google.com |
| **Upstash Redis** | ❌ Opcional | https://console.upstash.com |

---

## 🔧 Configuração em 5 Passos

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/Narrativas-Chronoscribe.git
cd Narrativas-Chronoscribe
```

### Passo 2: Instalar Dependências
```bash
npm install
```
**Tempo estimado:** 1-2 minutos

### Passo 3: Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha **APENAS AS VARIÁVEIS OBRIGATÓRIAS**:

```ini
# === OBRIGATÓRIAS ===
OPENAI_API_KEY=sk-proj-SUA_CHAVE_AQUI
AUTH_SECRET=RODE_COMANDO_ABAIXO_PARA_GERAR
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3100

# === OPCIONAIS (deixe em branco se não tiver) ===
# GOOGLE_CLOUD_PROJECT=
# GOOGLE_STORAGE_BUCKET=
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

**Gerar AUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copie a saída e cole em `AUTH_SECRET=`

### Passo 4: Configurar Banco de Dados
```bash
npx prisma db push
npm run seed:plans
```

### Passo 5: Rodar o Projeto
```bash
npm run dev
```

Acesse: **http://localhost:3100**

---

## 🎯 Teste das 8 Etapas do Arquiteto Escriba

### 1️⃣ Criar Conta
1. Acesse http://localhost:3100/register
2. Preencha os dados
3. Clique em "Cadastrar"

### 2️⃣ Fazer Login
1. Use o email e senha cadastrados
2. Você será redirecionado para `/dashboard`

### 3️⃣ Acessar o Arquiteto
1. No dashboard, clique em "Arquiteto de Narrativas"
2. Você verá a interface neon premium com 8 etapas

### 4️⃣ Testar Upload de Arquivos
1. **Etapa 1: Conhecimento Base**
2. Arraste e solte PDFs, DOCX ou TXT
3. Ou cole links e texto extra
4. Clique em "Analisar Conteúdo"

### 5️⃣ Selecionar Estilo Narrativo
1. **Etapa 2: Estilo Narrativo**
2. Escolha entre 16 estilos (ex: "Educativo Didático")
3. Veja a prévia em tempo real

### 6️⃣ Gerar Estrutura Visceral
1. **Etapa 5: Gerar Estrutura**
2. Clique em "Estrutura Visceral Agora"
3. Aguarde o loading cinematográfico
4. Veja a narrativa gerada com análise estratégica

### 7️⃣ Exportar em Múltiplos Formatos
1. **Etapa 7: Exportar Conteúdo**
2. Escolha entre: PDF, DOCX, Markdown, HTML, TXT, JSON
3. Clique em "Exportar"
4. Arquivo será baixado automaticamente

### 8️⃣ Compartilhar Narrativa
1. **Etapa 8: Compartilhar**
2. Clique em "Gerar Link de Compartilhamento"
3. Copie o link gerado
4. Abra em outra aba (link público temporário)

---

## 🐛 Solução de Problemas Comuns

### ❌ Erro: "OPENAI_API_KEY ausente"
**Solução:** Configure a chave no `.env.local`

### ❌ Erro: "Credenciais inválidas" (Google Cloud)
**Solução:** Google Cloud é **OPCIONAL**. Deixe em branco no `.env.local`. Os uploads funcionarão localmente.

### ❌ Erro: "Connection refused" (Redis)
**Solução:** Redis é **OPCIONAL**. O sistema funciona sem ele. Ignore os avisos `[ioredis] Unhandled error event`.

### ❌ Erro: "Database not found"
**Solução:** Rode novamente:
```bash
npx prisma db push
```

### ❌ Build falha com erro de TypeScript
**Solução:** Limpe o cache e reconstrua:
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 Checklist de Funcionalidades

Use esta lista para validar que tudo está funcionando:

- [ ] ✅ Cadastro de usuário funciona
- [ ] ✅ Login com credenciais funciona
- [ ] ✅ Dashboard carrega sem erros
- [ ] ✅ Upload de PDF extrai texto
- [ ] ✅ Upload de DOCX extrai texto
- [ ] ✅ Seleção de estilo narrativo responde
- [ ] ✅ Geração de narrativa com IA funciona
- [ ] ✅ Análise estratégica é exibida
- [ ] ✅ Exportação em PDF funciona
- [ ] ✅ Exportação em DOCX funciona
- [ ] ✅ Exportação em Markdown funciona
- [ ] ✅ Compartilhamento gera link público
- [ ] ✅ Animações Framer Motion funcionam
- [ ] ✅ Responsividade mobile funciona

---

## 🔒 Segurança

### ⚠️ NUNCA COMMITE PARA O GIT:
- `.env.local` (contém chaves secretas)
- `service-account-key.json` (Google Cloud)
- Qualquer arquivo com `API_KEY` no nome

### ✅ JÁ ESTÁ NO .gitignore:
- `.env.local`
- `.env`
- `node_modules/`
- `.next/`

---

## 📞 Precisa de Ajuda?

**Se algo não funcionar:**

1. Verifique que todas as **variáveis obrigatórias** estão preenchidas
2. Rode `npm install` novamente
3. Limpe o cache: `rm -rf .next`
4. Reinicie o servidor: `npm run dev`
5. Abra uma issue no GitHub com:
   - Descrição do problema
   - Logs de erro (se houver)
   - Versão do Node.js (`node --version`)

---

## 🎉 Pronto para Produção?

Quando tiver testado localmente e tudo estiver funcionando:

```bash
npm run build    # Build de produção
npm run start    # Servidor de produção na porta 3100
```

**Deploy sugerido:**
- **Vercel** (mais fácil, recomendado)
- **Google Cloud Run**
- **AWS Amplify**

Configure as mesmas variáveis de ambiente no painel da plataforma escolhida.

---

**Última atualização:** 2025-11-06  
**Versão do projeto:** 1.0.0  
**Status:** ✅ PRONTO PARA DESENVOLVIMENTO
