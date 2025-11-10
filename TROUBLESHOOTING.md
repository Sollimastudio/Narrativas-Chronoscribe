# 🚨 Guia de Solução de Problemas — ERR_CONNECTION_REFUSED

## Problema: "Não é possível acessar localhost" (ERR_CONNECTION_REFUSED)

### ✅ Causa
O servidor **não está rodando**. O erro `ERR_CONNECTION_REFUSED` significa que nada está escutando na porta 3100.

---

## 🔧 Solução Passo a Passo

### 1. Verificar se `.env.local` está configurado corretamente

O arquivo `.env.local` deve estar na **raiz do projeto** (não dentro de `src/` ou outras pastas).

**Localização correta:**
```
/home/seu-usuario/Narrativas-Chronoscribe/.env.local
```

**NÃO aqui:**
```
/home/seu-usuario/Narrativas-Chronoscribe/src/.env.local  ❌
```

**Conteúdo mínimo necessário:**
```bash
# .env.local
AUTH_SECRET=qualquer_texto_secreto_minimo_32_caracteres_1234567890
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL=http://localhost:3100
```

### 2. Validar a configuração

```bash
# No terminal, na raiz do projeto:
npm run validate
```

Se mostrar erros, corrija-os antes de continuar.

### 3. Instalar dependências (se ainda não fez)

```bash
npm install
```

### 4. Setup do banco de dados

```bash
npm run setup
```

Ou manualmente:
```bash
npx prisma db push
```

### 5. INICIAR o servidor

```bash
npm run dev
```

**Você deve ver:**
```
▲ Next.js 15.5.6
- Local:        http://localhost:3100
- Network:      http://192.168.x.x:3100

✓ Ready in 1383ms
```

### 6. Acessar no navegador

Agora sim, abra: **http://localhost:3100**

---

## ⚠️ Erros Comuns

### "Arquivo .env está vazio"
**Isso é normal!** O arquivo correto é `.env.local`, não `.env`.
- `.env` = template vazio (pode ignorar)
- `.env.local` = suas configurações reais

### "npm run dev falha"
Verifique os erros no terminal:

**Se disser "AUTH_SECRET ausente":**
```bash
npm run setup  # Isso gera automaticamente
```

**Se disser "porta 3100 em uso":**
```bash
# Linux/Mac:
lsof -ti:3100 | xargs kill -9

# Windows:
netstat -ano | findstr :3100
taskkill /PID <número> /F
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Checklist Rápido

Antes de tentar acessar localhost:

- [ ] Arquivo `.env.local` existe na raiz do projeto
- [ ] `.env.local` tem pelo menos `AUTH_SECRET` e `DATABASE_URL`
- [ ] Executou `npm install`
- [ ] Executou `npm run setup` ou `npx prisma db push`
- [ ] Executou `npm run dev` e está vendo "Ready in Xms"
- [ ] O terminal com `npm run dev` está **ainda aberto** (não fechou)

---

## 📝 Comandos na Ordem Correta

```bash
# 1. Ir para a raiz do projeto
cd /caminho/para/Narrativas-Chronoscribe

# 2. Criar .env.local (se não existe)
cat > .env.local << 'EOF'
AUTH_SECRET=texto_secreto_qualquer_minimo_32_chars_12345
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL=http://localhost:3100
EOF

# 3. Instalar
npm install

# 4. Setup
npm run setup

# 5. Validar
npm run validate

# 6. Rodar
npm run dev

# 7. Acessar no navegador
# http://localhost:3100
```

---

## ✅ Como Saber se Está Funcionando

### Terminal deve mostrar:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3100

✓ Ready in 1383ms
```

### Navegador deve abrir:
A página inicial do app (não erro de conexão)

### Teste de saúde:
Acesse: http://localhost:3100/api/health

Deve retornar JSON com:
```json
{
  "status": "ok",
  "environment": "development"
}
```

---

## 🆘 Ainda Não Funciona?

Execute este comando e cole a saída completa:

```bash
cd /caminho/para/Narrativas-Chronoscribe
echo "=== Verificando arquivos ==="
ls -la .env* 2>/dev/null || echo "Nenhum .env encontrado"
echo ""
echo "=== Conteúdo .env.local (se existir) ==="
cat .env.local 2>/dev/null || echo "Arquivo não existe"
echo ""
echo "=== Validação ==="
npm run validate
echo ""
echo "=== Tentando iniciar ==="
timeout 10 npm run dev || echo "Timeout ou erro"
```

Copie toda a saída e cole em um comentário para análise detalhada.
