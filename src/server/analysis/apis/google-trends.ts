import { env } from '@/config/env';

export interface GoogleTrendsData {
  query: string;
  interest_over_time: Array<{
    date: string;
    value: number;
  }>;
  interest_by_region: Record<string, number>;
  related_topics: Array<{
    topic: string;
    score: number;
  }>;
  related_queries: Array<{
    query: string;
    score: number;
  }>;
}

export class GoogleTrendsAPI {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = env.analytics.googleTrends.apiKey ?? '';
  }

  async getInterestOverTime(queries: string[]): Promise<Record<string, GoogleTrendsData>> {
    const response = await fetch('https://trends.googleapis.com/trends/api/v1/interest-over-time', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        queries,
        timeRange: 'last12months'
      })
    });

    if (!response.ok) {
      throw new Error(`Google Trends API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRegionalInterest(queries: string[]): Promise<Record<string, Record<string, number>>> {
    const response = await fetch('https://trends.googleapis.com/trends/api/v1/interest-by-region', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queries })
    });

    if (!response.ok) {
      throw new Error(`Google Trends API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRelatedTopics(queries: string[]): Promise<Record<string, Array<{
    topic: string;
    score: number;
  }>>> {
    const response = await fetch('https://trends.googleapis.com/trends/api/v1/related-topics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queries })
    });

    if (!response.ok) {
      throw new Error(`Google Trends API error: ${response.statusText}`);
    }

    return response.json();
  }

  async analyze(query: string): Promise<GoogleTrendsData> {
    // Use existing methods to get all data
    const [interestData, regionalData] = await Promise.all([
      this.getInterestOverTime([query]),
      this.getRegionalInterest([query])
    ]);

    return {
      query,
      interest_over_time: interestData[query]?.interest_over_time ?? [],
      interest_by_region: regionalData[query] ?? {},
      related_topics: interestData[query]?.related_topics ?? [],
      related_queries: interestData[query]?.related_queries ?? []
    };
  }
}
