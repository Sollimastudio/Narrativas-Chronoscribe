# Narrativas Chronoscribe · Meta-Agente L5

Aplicação Next.js (App Router) que permite arquitetar narrativas e roteiros multimídia utilizando o motor OpenAI. O painel combina modelagem de blueprint narrativa, enforcing de limites por plano e geração automatizada com rastreio de uso.

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
