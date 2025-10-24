# Narrativas Chronoscribe

Ferramenta web construída com Next.js que conecta sua estrutura de conteúdo ao modelo Gemini na Vertex AI. A interface conduz o usuário pelos 3 passos (Contexto, Estratégia e Execução) e apresenta o resultado com histórico, botões de copiar e exportação.

---

## 1. Pré-requisitos

- Node.js 18 ou superior
- Conta no Google Cloud com a API Vertex AI habilitada
- Uma conta de serviço com permissões **Vertex AI User** (ou **Generative AI User**) e um arquivo de credenciais JSON

---

## 2. Variáveis de ambiente

Crie um arquivo `.env.local` (use como base o exemplo abaixo):

```ini
GOOGLE_CLOUD_PROJECT=seu-projeto
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-pro
AUTH_SECRET=gere-um-valor-seguro-com-openssl-rand-base64-32
DATABASE_URL="file:./prisma/dev.db"

# Opção 1 – uso local
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/vertex-key.json

# Opção 2 – deploy (Base64)
# GOOGLE_APPLICATION_CREDENTIALS_BASE64=cole-a-string-base64-aqui
```

> Quando `GOOGLE_APPLICATION_CREDENTIALS` está preenchida, o backend usa o arquivo diretamente.  
> Quando apenas `GOOGLE_APPLICATION_CREDENTIALS_BASE64` é informado, o backend cria um arquivo temporário automaticamente (ideal para Vercel, Netlify etc.).

---

## 3. Converter a chave para Base64 (deploy)

Existe um utilitário pronto:

```bash
npm run encode-key -- caminho/para/vertex-key.json
```

O comando imprime uma única linha. Copie e cole esse texto na variável `GOOGLE_APPLICATION_CREDENTIALS_BASE64` do serviço onde o app será hospedado.

---

## 4. Rodar localmente

```bash
npm install
DATABASE_URL="file:./prisma/dev.db" npx prisma db push
npm run dev
```

Acesse `http://localhost:3000` (ou a porta que você escolher) para interagir com o Arquiteto de Narrativas.

---

## 5. Fluxo de deploy simplificado (Vercel)

1. **Repositório:** publique o código no GitHub/GitLab (sem a chave JSON).  
2. **Chave Base64:** execute `npm run encode-key -- chave.json` e guarde o resultado.  
3. **Projeto na Vercel:** conecte o repositório e crie um novo projeto.  
4. **Secrets obrigatórios:**
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_CLOUD_LOCATION`
   - `GEMINI_MODEL`
   - `AUTH_SECRET`
   - `DATABASE_URL` (ex.: `file:./tmp/dev.db` para ambiente de build, ou migre para um banco Postgres/MySQL hospedado)
   - `GOOGLE_APPLICATION_CREDENTIALS_BASE64`
5. **Deploy:** a Vercel roda `npm install` + `npm run build`. Após o sucesso, o app fica disponível no domínio `https://<projeto>.vercel.app`.  
6. (Opcional) Adicione um domínio próprio no painel da Vercel.

O comando `npm run build` é seguro porque não depende mais de downloads externos (fontes do Google foram removidas).

---

## 6. Usar no celular

O layout é responsivo. Depois do deploy:

1. Abra o link do app no navegador do celular.  
2. Use “Adicionar à tela inicial” (Safari ou Chrome) para criar um atalho que funciona como app nativo.  
3. O histórico, o botão de copiar e o download em Markdown funcionam da mesma forma no mobile.

---

## 7. Comandos úteis

| Comando                       | Descrição                                             |
|------------------------------|-------------------------------------------------------|
| `npm run dev`                | Ambiente de desenvolvimento                          |
| `npm run build`              | Build de produção (usado pela Vercel)                |
| `npm run start`              | Servir a build de produção localmente                |
| `npm run lint`               | Verificar lint                                      |
| `npm run encode-key -- file` | Gera a string Base64 da chave JSON para deploy       |
| `npx prisma db push`         | Sincroniza o schema Prisma com o banco (SQLite)      |

---

## 8. Notas rápidas

- O painel “Histórico de entregas” guarda as últimas 10 respostas; você pode restaurar, copiar ou baixar qualquer uma.
- O acesso agora é autenticado com login/senha (NextAuth). Crie sua conta em `/register` e depois entre em `/login`.
- Futuramente é possível ampliar para planos pagos (o modelo de dados já inclui `UsageLog` para mensurar consumo).
- Para melhorar a didática da resposta, use o campo **Diretrizes extras** antes de executar a tarefa.
- Para integrar com outros serviços (ex.: salvar no Drive, enviar para e-mail), basta criar novas ações no Passo 3 chamando outras rotas da API.
