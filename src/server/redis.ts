import Redis from 'ioredis';

// Lazy initialization to avoid connecting during build time
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  // Don't initialize Redis during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      
      // Only connect if not in build phase
      redisClient.connect().catch((err) => {
        console.warn('⚠️ Redis connection failed:', err.message);
        redisClient = null;
      });
    } catch (error) {
      console.warn('⚠️ Failed to initialize Redis:', error);
      redisClient = null;
    }
  }

  return redisClient;
}

export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const client = getRedisClient();
    if (!client) {
      // Return no-op functions for when Redis is not available
      if (typeof prop === 'string' && ['get', 'set', 'del', 'expire'].includes(prop)) {
        return async () => null;
      }
      return undefined;
    }
    return client[prop as keyof Redis];
  },
});
