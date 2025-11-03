# Insumos Extraídos do Projeto Anterior

## Modelos de Dados (Prisma)

- **User**: credenciais locais (`email`, `passwordHash`) com relacionamentos para `Session`, `Account`, `Subscription` e `UsageLog`.
- **Session / Account / VerificationToken**: suporte ao NextAuth (credential e provedores externos).
- **Plan**: planos de assinatura vinculados a `Subscription`.
- **Subscription**: associação `User` ↔ `Plan`, com indicador de atividade.
- **UsageLog**: auditoria de gerações de conteúdo para controle de limites.

> Observação: o código assume campos extras (`dailyGenerationsLimit`, `monthlyGenerationsLimit`, `priceCents`, `currency`, `isActive`, `status`) que não estavam materializados no schema.

## Lógica de Negócio Essencial

1. **Autenticação & Cadastro** (`app/api/auth/register`, `lib/auth.ts`): fluxo de criação de usuário com hash bcrypt, login via Credentials provider e propagação do `user.id` para sessão JWT.
2. **Assinaturas & Limites de Uso** (`lib/plans.ts`, `lib/usage.ts`): seed de planos padrão, recuperação de assinatura ativa, contagem diária/mensal de gerações (`UsageLog`) e bloqueios (`429`) ao exceder limites.
3. **Geração de Narrativas** (`app/api/generate/route.ts`): integração Vertex AI/Gemini, validação mínima de payload (`superPrompt`, `promptParaIA`), registro de uso em `UsageLog` e retorno do texto gerado.
4. **Observabilidade de Uso** (`app/api/usage/route.ts`): snapshot dos limites/consumo vigente.

## Padrões de Erros Detectados

1. **Inconsistência entre Schema e Código**  
   - `lib/plans.ts:23-45`, `lib/usage.ts:23-101` e `scripts/seed-plans.js:19-63` manipulam campos inexistentes em `prisma/schema.prisma` (ex.: `status`, `dailyGenerationsLimit`, `priceCents`, `currency`, `isActive`), causando falhas em tempo de execução.

2. **Arquivos Duplicados/Incompletos gerando ambiguidade**  
   - Componentes duplicados (`components/LoginForm.tsx` vazio vs `components/login-form.tsx`) e artefatos órfãos (`lib/prisma.ts.`) indicam build instável dependendo de sensibilidade a maiúsculas/minúsculas.

3. **Validação Insuficiente de Entradas e Configurações**  
   - Rotas críticas (`app/api/generate/route.ts`, `app/api/auth/register/route.ts`) aceitam payloads sem schema formal, não impõem `Content-Type` e não fazem sanitização robusta; configurações de ambiente (credenciais Vertex) não são verificadas de forma antecipada, atrasando erros para tempo de requisição.
