import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    redisInstance = new Redis(redisUrl, {
      // Configurações para evitar erros não tratados durante build
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Para de tentar após 3 tentativas
        }
        return Math.min(times * 100, 3000);
      },
      // Não logar erros de conexão durante build
      showFriendlyErrorStack: false,
    });
    
    // Tentar conectar mas não falhar se não conseguir
    redisInstance.connect().catch(() => {
      // Silenciar erros de conexão - o app pode funcionar sem Redis
    });
  }
  return redisInstance;
}

// Exportar para compatibilidade com código existente
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    return getRedis()[prop as keyof Redis];
  }
});
