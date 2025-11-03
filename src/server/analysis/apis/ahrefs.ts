import { env } from '@/config/env';
import { AnalyticsCache } from '@/server/cache/analytics';

export interface AhrefsContentData {
  url: string;
  domain: string;
  title: string;
  published: string;
  traffic: number;
  backlinks: number;
  shareCount: {
    facebook: number;
    twitter: number;
    linkedin: number;
    pinterest: number;
    total: number;
  };
  metrics: {
    dr: number;
    ur: number;
    wordCount: number;
  };
}

export interface AhrefsCompetitorData {
  domain: string;
  metrics: {
    dr: number;
    traffic: number;
    backlinks: number;
    keywords: number;
  };
  topPages: Array<{
    url: string;
    traffic: number;
    keywords: number;
  }>;
  contentGaps: Array<{
    keyword: string;
    difficulty: number;
    volume: number;
  }>;
}

export class AhrefsAPI {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor() {
    this.apiKey = env.analytics.ahrefs.apiKey ?? '';
    this.endpoint = env.analytics.ahrefs.endpoint ?? 'https://api.ahrefs.com/v1';
  }

  async getContentAnalysis(url: string): Promise<AhrefsContentData> {
    const cached = await AnalyticsCache.getCompetitiveAnalysis(url);
    if (cached) return cached as AhrefsContentData;

    const response = await fetch(`${this.endpoint}/content-explorer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`Ahrefs API error: ${response.statusText}`);
    }

    const data = await response.json();
    await AnalyticsCache.setCompetitiveAnalysis(url, data);
    return data;
  }

  async getCompetitorAnalysis(domain: string): Promise<AhrefsCompetitorData> {
    const cached = await AnalyticsCache.getCompetitiveAnalysis(domain);
    if (cached) return cached as AhrefsCompetitorData;

    const response = await fetch(`${this.endpoint}/site-explorer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        target: domain,
        mode: 'domain'
      })
    });

    if (!response.ok) {
      throw new Error(`Ahrefs API error: ${response.statusText}`);
    }

    const data = await response.json();
    await AnalyticsCache.setCompetitiveAnalysis(domain, data);
    return data;
  }

  async findContentGaps(domain: string, competitors: string[]): Promise<Array<{
    keyword: string;
    difficulty: number;
    volume: number;
    competitors: Array<{
      domain: string;
      rank: number;
    }>;
  }>> {
    const response = await fetch(`${this.endpoint}/content-gap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        target: domain,
        competitors 
      })
    });

    if (!response.ok) {
      throw new Error(`Ahrefs API error: ${response.statusText}`);
    }

    return response.json();
  }
}
