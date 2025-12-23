import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const envSchema = z.object({
  // Server-side
  DATABASE_URL: z.string().min(1).default('file:./dev.db'),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).optional(),
  GOOGLE_CLOUD_PROJECT: z.string().min(1).optional(),
  GOOGLE_STORAGE_BUCKET: z.string().min(1).optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
  GOOGLE_APPLICATION_CREDENTIALS_BASE64: z.string().optional(),

  // External Analytics providers (optional)
  SEMRUSH_API_KEY: z.string().optional(),
  SEMRUSH_ENDPOINT: z.string().url().optional(),
  GOOGLE_TRENDS_API_KEY: z.string().optional(),
  AHREFS_API_KEY: z.string().optional(),
  AHREFS_ENDPOINT: z.string().url().optional(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),

  // Defaults
  DEFAULT_PLAN_SLUG: z.string().optional(),

  // Shared
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXTAUTH_URL: z.string().optional(),
});

// Parse variáveis básicas (planas)
const raw = envSchema.parse(process.env);

// Early gating em variáveis essenciais
const isProd = raw.NODE_ENV === 'production';
const hasAuthSecret = Boolean(raw.AUTH_SECRET || raw.NEXTAUTH_SECRET);
const missing = [
  hasAuthSecret ? null : 'AUTH_SECRET/NEXTAUTH_SECRET',
  !raw.DATABASE_URL ? 'DATABASE_URL' : null,
  // NEXTAUTH_URL só é obrigatória em produção
  isProd && !raw.NEXTAUTH_URL ? 'NEXTAUTH_URL' : null,
  // OPENAI_API_KEY é opcional - app funciona em modo simulado sem ela
  // Google Cloud é opcional - app pode funcionar sem upload para nuvem
].filter(Boolean) as string[];
if (missing.length) {
  throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}. Configure seu .env.local.`);
}

// Objeto de configuração composto usado pelo resto do app
export const env = {
  ...raw,
  authSecret: (raw.AUTH_SECRET || raw.NEXTAUTH_SECRET || ''),
  GOOGLE_CLOUD_PROJECT: raw.GOOGLE_CLOUD_PROJECT ?? '',
  GOOGLE_STORAGE_BUCKET: raw.GOOGLE_STORAGE_BUCKET ?? '',
  openAI: {
    baseUrl: raw.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    apiKey: raw.OPENAI_API_KEY ?? '',
    model: raw.OPENAI_MODEL ?? 'gpt-4o-mini',
  },
  analytics: {
    semrush: {
      apiKey: raw.SEMRUSH_API_KEY ?? '',
      endpoint: raw.SEMRUSH_ENDPOINT ?? 'https://api.semrush.com',
    },
    googleTrends: {
      apiKey: raw.GOOGLE_TRENDS_API_KEY ?? '',
    },
    ahrefs: {
      apiKey: raw.AHREFS_API_KEY ?? '',
      endpoint: raw.AHREFS_ENDPOINT ?? 'https://api.ahrefs.com/v1',
    },
  },
  redis: {
    url: raw.UPSTASH_REDIS_REST_URL ?? '',
    token: raw.UPSTASH_REDIS_REST_TOKEN ?? '',
    socketUrl: raw.REDIS_URL ?? '',
  },
  defaults: {
    planSlug: raw.DEFAULT_PLAN_SLUG ?? 'free',
  },
} as const;

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }
  return value;
}

export function ensureCriticalEnv() {
  return true; // já validado acima; manter função para uso explícito em bootstrap se quiser
}

interface GoogleCredentials {
  project_id: string;
  client_email: string;
  private_key: string;
}

function isCredsForProject(creds: any, projectId: string) {
  return creds && typeof creds === 'object' && creds.project_id === projectId;
}

function normalizePrivateKey(k: string): string {
  // Corrige chaves com \n literais vindas de variáveis de ambiente
  return (k || '').includes('\\n') ? k.replace(/\\n/g, '\n') : k;
}

export function getGoogleCredentials(): GoogleCredentials {
  const expectedProject = env.GOOGLE_CLOUD_PROJECT;
  
  // Se não há projeto configurado, retornar credenciais vazias (modo desenvolvimento sem Google Cloud)
  if (!expectedProject) {
    throw new Error('Google Cloud não configurado. Configure GOOGLE_CLOUD_PROJECT e GOOGLE_STORAGE_BUCKET para usar upload na nuvem.');
  }

  // 1) Preferir credenciais codificadas (deploys)
  const encodedCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (encodedCredentials) {
    try {
      const decoded = Buffer.from(encodedCredentials, 'base64').toString();
      const credentials = JSON.parse(decoded);
      if (isCredsForProject(credentials, expectedProject)) {
        return {
          project_id: credentials.project_id,
          client_email: credentials.client_email,
          private_key: normalizePrivateKey(credentials.private_key),
        };
      }
    } catch (error) {
      console.warn('Erro ao decodificar credenciais:', error);
    }
  }

  // 2) Tentar chave local do projeto (service-account-key.json na raiz)
  const localJson = path.resolve(process.cwd(), 'service-account-key.json');
  if (fs.existsSync(localJson)) {
    try {
      const raw = fs.readFileSync(localJson, 'utf8');
      const credentials = JSON.parse(raw);
      if (isCredsForProject(credentials, expectedProject)) {
        return {
          project_id: credentials.project_id,
          client_email: credentials.client_email,
          private_key: normalizePrivateKey(credentials.private_key),
        };
      } else {
        console.warn('Arquivo local de credenciais não corresponde ao projeto esperado.');
      }
    } catch (error) {
      console.warn('Erro ao ler o arquivo local de credenciais:', error);
    }
  }

  // 3) Por último, usar a variável de ambiente do sistema
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    try {
      const raw = fs.readFileSync(credentialsPath, 'utf8');
      const credentials = JSON.parse(raw);
      if (isCredsForProject(credentials, expectedProject)) {
        return {
          project_id: credentials.project_id,
          client_email: credentials.client_email,
          private_key: normalizePrivateKey(credentials.private_key),
        };
      } else {
        console.warn('Credenciais apontadas pela GOOGLE_APPLICATION_CREDENTIALS não correspondem ao projeto esperado.');
      }
    } catch (error) {
      console.warn('Erro ao carregar credenciais do arquivo:', error);
    }
  }

  throw new Error('Credenciais do Google Cloud não encontradas');
}
