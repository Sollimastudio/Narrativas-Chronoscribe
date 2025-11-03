import { env } from '@/config/env';
import { SemrushAPI } from './apis/semrush';
import { GoogleTrendsAPI } from './apis/google-trends';
import { withErrorHandling } from '@/utils/analytics-errors';

export interface TrendAnalysis {
  volumes: Record<string, number>;
  trends: Array<{
    topic: string;
    growth: number;
    relevance: number;
    seasonality: {
      peak: string[];
      low: string[];
    };
    demographics: {
      ageGroups: string[];
      interests: string[];
      locations: string[];
    };
  }>;
  related: Array<{
    name: string;
    correlation: number;
    volume: number;
  }>;
}

export class MarketTrendsAPI {
  private semrush: SemrushAPI;
  private googleTrends: GoogleTrendsAPI;

  constructor() {
    this.semrush = new SemrushAPI();
    this.googleTrends = new GoogleTrendsAPI();
  }

  async getTrends(keywords: string[]): Promise<TrendAnalysis> {
    return withErrorHandling(
      async () => {
        const [semrushData, googleTrendsData] = await Promise.all([
          Promise.all(keywords.map(k => this.semrush.analyzeKeywords([k]))),
          Promise.all(keywords.map(k => this.googleTrends.analyze(k)))
        ]);

        return this.mergeAnalysis(
          this.processSemrushData(semrushData),
          this.processGoogleTrendsData(googleTrendsData)
        );
      },
      'MarketTrends',
      {
        volumes: {},
        trends: [],
        related: []
      }
    );
  }

  private processSemrushData(data: Record<string, any>[]) {
    const volumes: Record<string, number> = {};
    const trends: any[] = [];
    const related: any[] = [];

    data.forEach(keywordData => {
      Object.entries(keywordData).forEach(([keyword, data]: [string, any]) => {
        volumes[keyword] = data.search_volume;

        if (data.trend_data) {
          const growth = this.calculateGrowth(data.trend_data);
          trends.push({
            topic: keyword,
            growth,
            relevance: data.keyword_difficulty / 100,
            seasonality: this.analyzeTrendSeasonality(data.trend_data),
            demographics: {
              ageGroups: [],
              interests: [],
              locations: []
            }
          });
        }

        if (data.related_keywords) {
          related.push(...data.related_keywords.map((r: any) => ({
            name: r.keyword,
            correlation: r.correlation,
            volume: r.search_volume
          })));
        }
      });
    });

    return { volumes, trends, related };
  }

  private processGoogleTrendsData(data: Array<any>) {
    const trends = data.map(d => ({
      topic: d.topic,
      growth: this.calculateGrowthFromPoints(d.interest_over_time),
      relevance: 1,
      seasonality: {
        peak: [],
        low: []
      },
      demographics: {
        ageGroups: [],
        interests: [],
        locations: []
      }
    }));

    const related = data.flatMap(d => 
      d.related_topics.map((t: any) => ({
        name: t.topic,
        correlation: t.score / 100,
        volume: 0
      }))
    );

    return { trends, related };
  }

  private calculateGrowth(trendData: Array<{ date: string; value: number }>): number {
    if (trendData.length < 2) return 0;
    
    const first = trendData[0].value;
    const last = trendData[trendData.length - 1].value;
    
    return ((last - first) / first) * 100;
  }

  private calculateGrowthFromPoints(points: Array<{ date: string; value: number }>): number {
    if (points.length < 2) return 0;
    
    const first = points[0].value;
    const last = points[points.length - 1].value;
    
    return ((last - first) / first) * 100;
  }

  private analyzeTrendSeasonality(trendData: Array<{ date: string; value: number }>) {
    const monthlyAverages = new Map<string, number[]>();
    
    trendData.forEach(point => {
      const month = new Date(point.date).getMonth();
      if (!monthlyAverages.has(month.toString())) {
        monthlyAverages.set(month.toString(), []);
      }
      monthlyAverages.get(month.toString())?.push(point.value);
    });

    const averages = Array.from(monthlyAverages.entries()).map(([month, values]) => ({
      month: parseInt(month),
      average: values.reduce((a, b) => a + b, 0) / values.length
    }));

    const sorted = [...averages].sort((a, b) => b.average - a.average);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      peak: sorted.slice(0, 3).map(m => months[m.month]),
      low: sorted.slice(-3).map(m => months[m.month])
    };
  }

  private mergeAnalysis(
    semrushData: { volumes: Record<string, number>; trends: any[]; related: any[] },
    googleTrendsData: { trends: any[]; related: any[] }
  ): TrendAnalysis {
    const volumes = { ...semrushData.volumes };
    
    const trends = [...semrushData.trends];
    googleTrendsData.trends.forEach(trend => {
      const existing = trends.find(t => t.topic === trend.topic);
      if (existing) {
        existing.growth = (existing.growth + trend.growth) / 2;
      } else {
        trends.push(trend);
      }
    });

    const related = [...semrushData.related];
    googleTrendsData.related.forEach(rel => {
      const existing = related.find(r => r.name === rel.name);
      if (existing) {
        existing.correlation = (existing.correlation + rel.correlation) / 2;
      } else {
        related.push(rel);
      }
    });

    return {
      volumes,
      trends,
      related
    };
  }
}
