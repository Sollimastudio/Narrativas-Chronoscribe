import { GeneratedNarrative } from '@/domain/narratives/blueprint';
import { AnalyticsData } from '@/domain/narratives/workflow';
import { withErrorHandling } from '@/utils/analytics-errors';
import { OpenAIProvider } from './openai-provider';
import { MarketTrendsAPI } from '../analysis/market-trends';
import { CompetitiveAnalyzer } from '../analysis/competitive';
import { AudienceInsightService } from '../analysis/audience';
import { AnalyticsCache } from '../cache/analytics';

export interface TrendData {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: 'informational' | 'commercial' | 'navigational' | 'transactional';
  trend: 'up' | 'down' | 'stable';
}

export interface CompetitorContent {
  url: string;
  title: string;
  snippet: string;
  metrics: {
    shares: number;
    backlinks: number;
    engagement: number;
  };
}

export interface EmotionalTone {
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'neutral';
  intensity: number;
  subemotions: string[];
}

export interface ContentInsight {
  topic: string;
  relevance: number;
  sentiment: number;
  emotionalTone: EmotionalTone;
  readability: {
    score: number;
    level: 'basic' | 'intermediate' | 'advanced';
    suggestions: string[];
  };
  engagement: {
    hook: string;
    peakMoments: string[];
    emotionalTriggers: string[];
  };
}

export interface MarketInsight {
  trends: TrendData[];
  competitors: CompetitorContent[];
  gaps: string[];
  opportunities: string[];
}

export class StrategicAnalyzer {
  constructor(
    private openai: OpenAIProvider,
    private marketTrends: MarketTrendsAPI,
    private competitive: CompetitiveAnalyzer,
    private audience: AudienceInsightService
  ) {}

  async analyzeContent(
    content: string,
    topic: string,
    format: string
  ): Promise<AnalyticsData> {
    return withErrorHandling(
      async () => {
        const cachedAnalysis = await AnalyticsCache.get(content, format);
        if (cachedAnalysis) return cachedAnalysis as unknown as AnalyticsData;

        const [marketTrendsData, competitiveData, audienceData] = await Promise.all([
          this.analyzeMarketTrends(topic),
          this.analyzeCompetition(topic, content),
          this.analyzeAudience(topic),
        ]);

        // Placeholder content insights using provider simple endpoints
        const contentInsights = await this.openai.analyzeReadability(content).then(r => ({
          emotionalScore: 50,
          viralPotential: 50,
          uniquenessScore: 50,
          controversyLevel: 10,
          narrativeHooks: [],
          emotionalTriggers: [],
          readability: { score: r.score, level: r.level, suggestions: r.improvements },
          engagement: { estimatedReadTime: r.readTime, attentionHotspots: r.hotspots, retentionFactors: r.retention },
          seoMetrics: { difficulty: 50, competition: 50, opportunity: 50, recommendedLength: 800 }
        })).catch(() => ({
          emotionalScore: 0,
          viralPotential: 0,
          uniquenessScore: 0,
          controversyLevel: 0,
          narrativeHooks: [],
          emotionalTriggers: [],
          readability: { score: 0, level: 'intermediate', suggestions: [] },
          engagement: { estimatedReadTime: 0, attentionHotspots: [], retentionFactors: [] },
          seoMetrics: { difficulty: 0, competition: 0, opportunity: 0, recommendedLength: 0 }
        }));

        const recommendations = await this.openai.generateContentStrategy({
          content,
          format,
          marketTrends: marketTrendsData,
          contentInsights,
          competitiveAnalysis: competitiveData,
          audienceData
        }).catch(() => ({
          hooks: [], angles: [], channels: [], timing: { days: [], hours: [], seasonal: [], events: [] },
          format: { structure: [], elements: [], style: [], examples: [] },
          distribution: { primary: [], secondary: [], promotional: { channels: [], tactics: [], timing: [] } }
        }));

        const analysis: AnalyticsData = {
          marketTrends: {
            keywords: [topic],
            volumes: marketTrendsData.volumes ?? {},
            trends: marketTrendsData.trends ?? [],
            relatedTopics: (marketTrendsData.related ?? []).map((r: any) => r.name ?? r.topic ?? ''),
          },
          contentInsights,
          competitiveAnalysis: {
            topPerformers: (competitiveData.competitors ?? []).map((c: any) => ({
              title: c.title,
              url: c.url,
              engagement: c.engagement ?? 0,
              shareCount: c.shares ?? 0,
              platform: c.platform ?? '',
              format: c.format ?? ''
            })),
            gaps: competitiveData.gaps ?? [],
            opportunities: competitiveData.opportunities ?? [],
            marketPosition: { saturation: competitiveData.saturation ?? 0, uniqueAngles: competitiveData.uniqueAngles ?? [], barriers: competitiveData.barriers ?? [] }
          },
          strategyRecommendations: {
            hooks: recommendations.hooks ?? [],
            angles: recommendations.angles ?? [],
            distributionChannels: recommendations.channels ?? [],
            timing: { bestDays: recommendations.timing?.days ?? [], bestTimes: recommendations.timing?.hours ?? [], seasonalOpportunities: recommendations.timing?.seasonal ?? [], eventAlignment: (recommendations.timing?.events ?? []).map((e: any) => e.event) },
            formatSpecific: { structure: recommendations.format?.structure ?? [], elements: recommendations.format?.elements ?? [], style: recommendations.format?.style ?? [], examples: recommendations.format?.examples ?? [] },
            distribution: recommendations.distribution ?? { primary: [], secondary: [], promotional: { channels: [], tactics: [], timing: [] } }
          },
          audienceInsights: {
            segments: audienceData.motivations ?? [],
            preferences: audienceData.values ?? [],
            behaviors: Object.keys(audienceData.behaviorPatterns ?? {}),
            painPoints: audienceData.painPoints ?? []
          }
        };

        await AnalyticsCache.set(content, format, analysis);
        return analysis;
      },
      'StrategicAnalyzer',
      // Fallback mínimo
      {
        marketTrends: { keywords: [], volumes: {}, trends: [], relatedTopics: [] },
        contentInsights: { emotionalScore: 0, viralPotential: 0, uniquenessScore: 0, controversyLevel: 0, narrativeHooks: [], emotionalTriggers: [], readability: { score: 0, level: 'intermediate', suggestions: [] }, engagement: { estimatedReadTime: 0, attentionHotspots: [], retentionFactors: [] }, seoMetrics: { difficulty: 0, competition: 0, opportunity: 0, recommendedLength: 0 } },
        competitiveAnalysis: { topPerformers: [], gaps: [], opportunities: [], marketPosition: { saturation: 0, uniqueAngles: [], barriers: [] } },
        strategyRecommendations: { hooks: [], angles: [], distributionChannels: [], timing: { bestDays: [], bestTimes: [], seasonalOpportunities: [], eventAlignment: [] }, formatSpecific: { structure: [], elements: [], style: [], examples: [] }, distribution: { primary: [], secondary: [], promotional: { channels: [], tactics: [], timing: [] } } },
        audienceInsights: { segments: [], preferences: [], behaviors: [], painPoints: [] }
      }
    );
  }

  private async analyzeMarketTrends(topic: string) {
    return withErrorHandling(
      async () => {
        return await this.marketTrends.getTrends([topic]);
      },
      'MarketTrends',
      { volumes: {}, trends: [], related: [] }
    );
  }

  private async analyzeCompetition(topic: string, content: string) {
    return withErrorHandling(
      async () => {
        return await this.competitive.analyze(content, topic);
      },
      'CompetitiveAnalysis',
      {
        competitors: [],
        gaps: [],
        opportunities: [],
        saturation: 0,
        uniqueAngles: [],
        barriers: []
      }
    );
  }

  private async analyzeAudience(topic: string) {
    return withErrorHandling(
      async () => {
        return await this.audience.analyze(topic);
      },
      'AudienceInsights',
      {
        ageDistribution: {},
        interestAffinity: {},
        behaviorPatterns: {},
        motivations: [],
        painPoints: [],
        goals: [],
        values: [],
        platformEngagement: {},
        formatPreferences: {},
        engagementTimes: {}
      }
    );
  }
}
