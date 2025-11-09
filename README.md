# Narrativas Chronoscribe · Meta-Agente L5 - Arquiteto Mestre

**Estúdio completo de narrativas persuasivas.** Transforme PDFs, textos e ideias em conteúdo de alta conversão usando PNL, UCG e Storytelling Estratégico.

## ✨ O Que Este App Faz?

Cria conteúdo profissional persuasivo em 9 etapas simples:

1. **Upload** - Envie PDFs, DOCX, links
2. **Tipo** - Escolha: Livro, Ebook, Carrossel, VSL, Mentoria, etc
3. **Objetivos** - Vendas, Engajamento, Crescimento, Autoridade...
4. **Estilo** - Montanha-Russa da Viralidade, Executivo, Poético...
5. **Análise** - Crítica estratégica do conteúdo
6. **Arte** - Prompts profissionais de imagem
7. **Geração** - ✨ Conteúdo persuasivo completo usando a Constituição Chronoscribe
8. **Exportação** - PDF, DOCX, Markdown (em breve)
9. **Reutilização** - Variações e adaptações (em breve)

## 🚀 Setup Rápido (2 minutos)

```bash
# 1. Instalar
npm install

# 2. Configurar banco e variáveis
npm run setup

# 3. Adicionar sua chave OpenAI (OPCIONAL - funciona sem!)
# Edite .env.local e adicione:
# OPENAI_API_KEY=sk-sua-chave-aqui

# 4. Iniciar
npm run dev

# 5. Acessar
# http://localhost:3100/arquiteto
```

> **Sem chave OpenAI?** O app funciona em modo simulado (exemplo). Para conteúdo real, adicione a chave.

## 📖 [Guia Completo de Uso](./GUIA-DE-USO.md)

**Leia o [GUIA-DE-USO.md](./GUIA-DE-USO.md)** para instruções detalhadas, dicas e solução de problemas.

---

## Stack

- **UI**: Next.js 13 App Router, React 18.
- **Autenticação**: NextAuth (Credentials + JWT).
- **Banco**: Prisma ORM (PostgreSQL).
- **IA**: Provedor OpenAI (configurável via variável de ambiente).
- **Testes**: Node `--test` com TypeScript transpilado.

> Consulte `docs/architecture.md` para visão detalhada da nova arquitetura em camadas.

## Pré-requisitos

- Node.js 18 ou superior.
- Banco PostgreSQL acessível (local ou gerenciado).
- Chave da API OpenAI com acesso ao modelo escolhido.

## Variáveis de ambiente

Crie `.env.local` a partir da base abaixo (o script `npm run setup` também gera o arquivo):

```ini
OPENAI_API_KEY=coloque_sua_chave_aqui
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
AUTH_SECRET=gera_um_valor_randômico
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
# DEFAULT_PLAN_SLUG=free
```

- `OPENAI_API_KEY` é obrigatória para a rota `/api/narratives`.
- `DEFAULT_PLAN_SLUG` define o plano inicial atribuído quando o usuário ainda não possui assinatura.

## Setup rápido

```bash
npm install
npm run setup             # cria .env.local se faltar, gera AUTH_SECRET e sincroniza Prisma se possível
npx prisma db push        # sincroniza o schema com o banco configurado
npm run seed:plans        # registra/atualiza planos padrão (free/creator/scale)
```

Se preferir SQLite local para desenvolvimento, defina `DATABASE_URL="file:./prisma/dev.db"` e execute `npx prisma db push`.

## Executar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`. Crie uma conta em `/register` e utilize o painel em `/dashboard`.

## Testes

```bash
npm run test
```

O script compila os módulos de domínio para `dist-test/`, executa os testes unitários (`node --test`) e remove a pasta temporária ao final. Os testes atuais cobrem a validação preditiva do blueprint narrativo.

## Scripts úteis

| Comando            | Descrição                                                                |
|--------------------|---------------------------------------------------------------------------|
| `npm run setup`    | Gera `.env.local`, AUTH_SECRET e tenta sincronizar Prisma.                |
| `npm run seed:plans` | Atualiza/insere planos padrão na tabela `Plan`.                       |
| `npm run check-env` | Valida se variáveis críticas (`OPENAI_API_KEY`, etc.) estão presentes. |
| `npm run release`  | check-env → lint → build (e deploy opcional via Vercel CLI).             |

## Deploy

### Vercel

1. Configure as variáveis no dashboard (ver lista acima).
2. Opcional: `DEFAULT_PLAN_SLUG` para definir o plano inicial.
3. Rode `npm run release` localmente antes de enviar para garantir build limpa.

### Cloud Run / Firebase Hosting

1. Gere build de produção: `npm run build`.
2. Execute `npm run start` com as variáveis exportadas em runtime.
3. Lembre-se de adicionar `OPENAI_API_KEY` como secret na plataforma escolhida.

## Próximos passos sugeridos

- Conectar faturas ou cobrança recorrente aos planos para monetização automática.
- Persistir histórico de narrativas geradas (nova tabela) e permitir reprocessamento.
- Instrumentar observabilidade (ex.: OpenTelemetry + exporter para GCP).
