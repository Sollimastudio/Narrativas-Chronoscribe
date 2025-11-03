# Narrativas Chronoscribe – Nova Arquitetura

## Estrutura de Pastas

```
src/
  app/
    (public)/landing/page.tsx
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    dashboard/page.tsx
    api/
      auth/[...nextauth]/route.ts
      auth/register/route.ts
      narratives/generate/route.ts
      usage/route.ts
    layout.tsx
    providers.tsx
  components/
    forms/
    layout/
    narratives/
  config/
    env.ts
  domain/
    narratives/
      blueprint.ts
      schema.ts
      strategy.ts
  server/
    ai/
      openai-provider.ts
      narrative-service.ts
    auth/
      options.ts
    prisma/
      client.ts
    usage/
      limits.ts
  utils/
    errors.ts
    validation.ts
tests/
  integration/
  unit/
```

## Princípios

- **Separação clara de camadas**: domínio, infraestrutura (server) e interface (app/components).
- **Invariantes explícitas**: schema Zod para validar entradas e formato das narrativas.
- **Providers desacoplados**: camada `server/ai` expõe contratos para uso com OpenAI ou futuros provedores.
- **Prisma centralizado**: acesso único via `server/prisma/client.ts`.
- **Erros previstos**: utilitários dedicados para mapeamento de falhas em API/IA.
- **Testabilidade**: organização em módulos puros facilita testes unitários e integração.
