import { Redis } from '@upstash/redis';
import { env } from '@/config/env';
import { AnalyticsData } from '@/domain/narratives/workflow';

const hasUpstash = Boolean(env.redis.url && env.redis.token);

const redis = hasUpstash
  ? new Redis({
      url: env.redis.url,
      token: env.redis.token,
    })
  : null as unknown as Redis;

// Simple in-memory fallback cache for development
const memory = new Map<string, { data: AnalyticsData; exp: number }>();
const CACHE_TTL = 60 * 60 * 24; // 24 hours

export class AnalyticsCache {
  private static generateKey(content: string, format: string): string {
    const hash = Buffer.from(content).toString('base64');
    return `analytics:${format}:${hash}`;
  }

  static async get(content: string, format: string): Promise<AnalyticsData | null> {
    const key = this.generateKey(content, format);

    if (hasUpstash && redis) {
      return (await redis.get<AnalyticsData>(key)) ?? null;
    }

    const entry = memory.get(key);
    if (!entry) return null;
    if (Date.now() > entry.exp) {
      memory.delete(key);
      return null;
    }
    return entry.data;
  }

  static async set(content: string, format: string, data: AnalyticsData): Promise<void> {
    const key = this.generateKey(content, format);

    if (hasUpstash && redis) {
      await redis.set(key, data, { ex: CACHE_TTL });
      return;
    }

    memory.set(key, { data, exp: Date.now() + CACHE_TTL * 1000 });
  }

  static async invalidate(content: string, format: string): Promise<void> {
    const key = this.generateKey(content, format);

    if (hasUpstash && redis) {
      await redis.del(key);
      return;
    }

    memory.delete(key);
  }

  static async getMarketTrends(keywords: string[]): Promise<Record<string, any> | null> {
    const key = `trends:${keywords.sort().join(',')}`;
    if (hasUpstash && redis) {
      return (await redis.get(key)) as any;
    }
    const entry = memory.get(key);
    return entry?.data as any ?? null;
  }

  static async setMarketTrends(keywords: string[], data: Record<string, any>): Promise<void> {
    const key = `trends:${keywords.sort().join(',')}`;
    if (hasUpstash && redis) {
      await redis.set(key, data, { ex: CACHE_TTL });
      return;
    }
    memory.set(key, { data: data as any, exp: Date.now() + CACHE_TTL * 1000 });
  }

  static async getCompetitiveAnalysis(domain: string): Promise<Record<string, any> | null> {
    const key = `competitive:${domain}`;
    if (hasUpstash && redis) {
      return (await redis.get(key)) as any;
    }
    const entry = memory.get(key);
    return entry?.data as any ?? null;
  }

  static async setCompetitiveAnalysis(domain: string, data: Record<string, any>): Promise<void> {
    const key = `competitive:${domain}`;
    if (hasUpstash && redis) {
      await redis.set(key, data, { ex: CACHE_TTL });
      return;
    }
    memory.set(key, { data: data as any, exp: Date.now() + CACHE_TTL * 1000 });
  }

  static async getAudienceInsights(industry: string): Promise<Record<string, any> | null> {
    const key = `audience:${industry}`;
    if (hasUpstash && redis) {
      return (await redis.get(key)) as any;
    }
    const entry = memory.get(key);
    return entry?.data as any ?? null;
  }

  static async setAudienceInsights(industry: string, data: Record<string, any>): Promise<void> {
    const key = `audience:${industry}`;
    if (hasUpstash && redis) {
      await redis.set(key, data, { ex: CACHE_TTL });
      return;
    }
    memory.set(key, { data: data as any, exp: Date.now() + CACHE_TTL * 1000 });
  }
}
