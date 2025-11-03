import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/analytics/dashboard';
import { TrendChart, ContentInsightRadar, CompetitorChart, AudienceInsightChart } from '@/components/analytics/charts';

const mockAnalyticsData = {
  marketTrends: {
    keywords: ['content', 'strategy'],
    volumes: { content: 1000, strategy: 800 },
    trends: [
      {
        topic: 'Content Marketing',
        growth: 0.5,
        relevance: 0.8,
        seasonality: {
          peak: ['Q4'],
          low: ['Q1']
        },
        demographics: {
          ageGroups: ['25-34'],
          interests: ['Marketing'],
          locations: ['US']
        }
      }
    ],
    relatedTopics: [
      {
        name: 'Digital Marketing',
        correlation: 0.8,
        searchVolume: 1200
      }
    ]
  },
  contentInsights: {
    emotionalScore: 0.7,
    viralPotential: 0.6,
    uniquenessScore: 0.8,
    controversyLevel: 0.3,
    narrativeHooks: ['Innovation', 'Success Stories'],
    emotionalTriggers: ['Hope', 'Curiosity'],
    readability: {
      score: 75,
      level: 'intermediate',
      suggestions: ['Shorten paragraphs']
    },
    engagement: {
      estimatedReadTime: 5,
      attentionHotspots: ['Introduction', 'Case Study'],
      retentionFactors: ['Strong Examples']
    },
    seoMetrics: {
      difficulty: 45,
      competition: 60,
      opportunity: 75,
      recommendedLength: 1500
    }
  },
  competitiveAnalysis: {
    topPerformers: [
      {
        title: 'Competitor 1',
        url: 'https://example.com',
        engagement: 1000,
        shareCount: 500,
        publishDate: '2025-10-01',
        platform: 'Blog',
        format: 'Article',
        strengths: ['SEO'],
        weaknesses: ['Engagement']
      }
    ],
    gaps: ['Video Content'],
    opportunities: ['Technical Guides'],
    marketPosition: {
      saturation: 0.6,
      uniqueAngles: ['AI Integration'],
      barriers: ['Technical Complexity']
    }
  },
  strategyRecommendations: {
    hooks: ['Future of Work'],
    angles: ['Innovation Impact'],
    distributionChannels: ['LinkedIn', 'Industry Forums'],
    timing: {
      bestDays: ['Tuesday', 'Wednesday'],
      bestTimes: ['10:00', '15:00'],
      seasonalOpportunities: ['Q4 Planning'],
      eventAlignment: [
        {
          event: 'Tech Conference',
          date: '2025-12-01',
          relevance: 0.9
        }
      ]
    },
    formatSpecific: {
      structure: ['Problem-Solution'],
      elements: ['Case Studies'],
      style: ['Professional'],
      examples: ['Industry Reports']
    },
    distribution: {
      primary: ['Email Newsletter'],
      secondary: ['Social Media'],
      promotional: {
        channels: ['LinkedIn Ads'],
        tactics: ['Influencer Partnership'],
        timing: ['Pre-event']
      }
    }
  },
  audienceInsights: {
    demographics: {
      age: { '25-34': 0.4, '35-44': 0.3 },
      interests: { 'Technology': 0.8, 'Business': 0.7 },
      behavior: { 'Mobile': 0.6, 'Desktop': 0.4 }
    },
    psychographics: {
      motivations: ['Career Growth'],
      painPoints: ['Time Management'],
      goals: ['Efficiency'],
      values: ['Innovation']
    },
    engagement: {
      platforms: { 'LinkedIn': 0.8, 'Twitter': 0.6 },
      formats: { 'Articles': 0.7, 'Videos': 0.5 },
      peakTimes: { 'Morning': 0.6, 'Afternoon': 0.4 }
    }
  }
};

describe('Analytics Components', () => {
  describe('AnalyticsDashboard', () => {
    it('renders all sections correctly', () => {
      render(<AnalyticsDashboard data={mockAnalyticsData} />);
      
      expect(screen.getByText('Market Trends')).toBeDefined();
      expect(screen.getByText('Content Insights')).toBeDefined();
      expect(screen.getByText('Competitive Analysis')).toBeDefined();
      expect(screen.getByText('Audience Insights')).toBeDefined();
      expect(screen.getByText('Strategy Recommendations')).toBeDefined();
    });

    it('displays all insight cards with data', () => {
      render(<AnalyticsDashboard data={mockAnalyticsData} />);
      
      expect(screen.getByText('Related Topics')).toBeDefined();
      expect(screen.getByText('Narrative Hooks')).toBeDefined();
      expect(screen.getByText('SEO Insights')).toBeDefined();
      expect(screen.getByText('Market Gaps')).toBeDefined();
    });
  });

  describe('Charts', () => {
    it('renders TrendChart correctly', () => {
      render(<TrendChart data={mockAnalyticsData.marketTrends.trends} />);
      expect(screen.getByRole('graphics-document')).toBeDefined();
    });

    it('renders ContentInsightRadar correctly', () => {
      render(<ContentInsightRadar data={mockAnalyticsData.contentInsights} />);
      expect(screen.getByRole('graphics-document')).toBeDefined();
    });

    it('renders CompetitorChart correctly', () => {
      render(<CompetitorChart data={mockAnalyticsData.competitiveAnalysis.topPerformers} />);
      expect(screen.getByRole('graphics-document')).toBeDefined();
    });

    it('renders AudienceInsightChart correctly', () => {
      render(<AudienceInsightChart data={mockAnalyticsData.audienceInsights} />);
      expect(screen.getByRole('graphics-document')).toBeDefined();
    });
  });
});
