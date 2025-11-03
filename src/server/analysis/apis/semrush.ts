import { env } from '@/config/env';
import { withErrorHandling } from '@/utils/analytics-errors';

export interface SemrushKeywordData {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competitive_density: number;
  intent: string;
  trend_data: Array<{
    date: string;
    value: number;
  }>;
  related_keywords: Array<{
    keyword: string;
    search_volume: number;
    correlation: number;
  }>;
}

export class SemrushAPI {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor() {
    this.apiKey = env.analytics.semrush.apiKey;
    this.endpoint = env.analytics.semrush.endpoint;
  }

  async analyzeKeywords(keywords: string[]): Promise<Record<string, SemrushKeywordData>> {
    return withErrorHandling(
      async () => {
        const response = await fetch(`${this.endpoint}/analytics/v1/keywords`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ keywords })
        });

        if (!response.ok) {
          throw new Error(`SEMrush API error: ${response.statusText}`);
        }

        return response.json();
      },
      'SemRush',
      {} // Empty result as fallback
    );
  }

  async getTrendingTopics(industry: string): Promise<Array<{
    topic: string;
    growth: number;
    volume: number;
    difficulty: number;
  }>> {
    return withErrorHandling(
      async () => {
        const response = await fetch(`${this.endpoint}/trends/industry/${encodeURIComponent(industry)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`SEMrush API error: ${response.statusText}`);
        }

        return response.json();
      },
      'SemRush',
      [] // Empty array as fallback
    );
  }

  async getCompetitorInsights(domain: string): Promise<{
    traffic: number;
    keywords: number;
    competitors: Array<{
      domain: string;
      commonKeywords: number;
      traffic: number;
    }>;
  }> {
    return withErrorHandling(
      async () => {
        const response = await fetch(`${this.endpoint}/analytics/v1/domains/${encodeURIComponent(domain)}/competitors`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`SEMrush API error: ${response.statusText}`);
        }

        return response.json();
      },
      'SemRush',
      { traffic: 0, keywords: 0, competitors: [] } // Empty result as fallback
    );
  }
}
