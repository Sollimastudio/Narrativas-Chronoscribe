import { NextResponse } from 'next/server';
import { env } from '@/config/env';
import { storageService } from '@/server/storage/google-storage';

export async function GET() {
  try {
    // Verifica configurações críticas
    const hasOpenAI = Boolean(env.openAI.apiKey);
    const hasAuth = Boolean(env.authSecret);
    const hasDatabase = Boolean(env.DATABASE_URL);
    
    // Verifica Google Cloud Storage
    const storageStatus = storageService.getStatus();
    
    // Determina modo de operação
    const mode = hasOpenAI ? 'real' : 'mock';
    
    // Status geral
    const isHealthy = hasAuth && hasDatabase;
    const canGenerate = hasOpenAI;
    
    return NextResponse.json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      mode,
      services: {
        openai: {
          configured: hasOpenAI,
          model: env.openAI.model,
          status: hasOpenAI ? 'ok' : 'not_configured',
        },
        auth: {
          configured: hasAuth,
          status: hasAuth ? 'ok' : 'error',
        },
        database: {
          configured: hasDatabase,
          status: hasDatabase ? 'ok' : 'error',
        },
        storage: {
          configured: storageStatus.available,
          bucket: storageStatus.bucket,
          status: storageStatus.available ? 'ok' : 'optional',
        },
      },
      capabilities: {
        generateContent: canGenerate,
        authentication: hasAuth,
        uploadFiles: storageStatus.available,
      },
      environment: env.NODE_ENV,
    }, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error('[/api/health] Erro ao verificar saúde do sistema:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, {
      status: 500,
    });
  }
}
