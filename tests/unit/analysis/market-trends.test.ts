import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { MarketTrendsAPI } from '@/server/analysis/market-trends';
import { SemrushAPI } from '@/server/analysis/apis/semrush';
import { GoogleTrendsAPI } from '@/server/analysis/apis/google-trends';

vi.mock('@/server/analysis/apis/semrush');
vi.mock('@/server/analysis/apis/google-trends');

describe('MarketTrendsAPI', () => {
  let api: MarketTrendsAPI;
  let mockSemrushAPI: { analyzeKeywords: MockInstance };
  let mockGoogleTrendsAPI: { analyze: MockInstance };

  beforeEach(() => {
    mockSemrushAPI = {
      analyzeKeywords: vi.fn(),
    } as any;

    mockGoogleTrendsAPI = {
      analyze: vi.fn(),
    } as any;

    (SemrushAPI as any).mockImplementation(() => mockSemrushAPI);
    (GoogleTrendsAPI as any).mockImplementation(() => mockGoogleTrendsAPI);

    api = new MarketTrendsAPI();
  });

  describe('getTrends', () => {
    it('should merge data from both APIs', async () => {
      const semrushMockData = {
        'test-keyword': {
          search_volume: 1000,
          keyword_difficulty: 45,
          trend_data: [
            { date: '2023-01', value: 900 },
            { date: '2023-12', value: 1100 }
          ],
          related_keywords: [
            {
              keyword: 'related-test',
              search_volume: 500,
              correlation: 0.75
            }
          ]
        }
      };

      const googleTrendsMockData = {
        query: 'test-keyword',
        interest_over_time: [
          { date: '2023-01', value: 80 },
          { date: '2023-12', value: 100 }
        ],
        interest_by_region: { 'US': 100 },
        related_topics: [
          { topic: 'related-topic', score: 85 }
        ],
        related_queries: [
          { query: 'related-query', score: 90 }
        ]
      };

      mockSemrushAPI.analyzeKeywords.mockResolvedValueOnce(semrushMockData);
      mockGoogleTrendsAPI.analyze.mockResolvedValueOnce(googleTrendsMockData);

      const result = await api.getTrends(['test-keyword']);

      expect(result.volumes['test-keyword']).toBe(1000);
      expect(result.trends).toHaveLength(1);
      expect(result.related).toHaveLength(2); // 1 from Semrush + 1 from Google

      // Verify trend analysis
      const trend = result.trends[0];
      expect(trend.topic).toBe('test-keyword');
      expect(trend.growth).toBeGreaterThan(0); // Should show positive growth
      expect(trend.relevance).toBe(0.45); // 45/100
      expect(trend.seasonality).toBeDefined();
      expect(trend.demographics).toBeDefined();

      // Verify API calls
      expect(mockSemrushAPI.analyzeKeywords).toHaveBeenCalledWith(['test-keyword']);
      expect(mockGoogleTrendsAPI.analyze).toHaveBeenCalledWith('test-keyword');
    });

    it('should handle API errors gracefully', async () => {
      mockSemrushAPI.analyzeKeywords.mockRejectedValueOnce(new Error('API Error'));
      mockGoogleTrendsAPI.analyze.mockRejectedValueOnce(new Error('API Error'));

      const result = await api.getTrends(['test-keyword']);

      expect(result.volumes).toEqual({});
      expect(result.trends).toEqual([]);
      expect(result.related).toEqual([]);
    });

    it('should merge overlapping topics correctly', async () => {
      const semrushMockData = {
        'common-topic': {
          search_volume: 1000,
          keyword_difficulty: 50,
          trend_data: [
            { date: '2023-01', value: 1000 },
            { date: '2023-12', value: 1200 }
          ],
          related_keywords: [
            {
              keyword: 'common-related',
              search_volume: 500,
              correlation: 0.8
            }
          ]
        }
      };

      const googleTrendsMockData = {
        query: 'common-topic',
        interest_over_time: [
          { date: '2023-01', value: 80 },
          { date: '2023-12', value: 100 }
        ],
        related_topics: [
          { topic: 'common-related', score: 90 }
        ],
        related_queries: []
      };

      mockSemrushAPI.analyzeKeywords.mockResolvedValueOnce(semrushMockData);
      mockGoogleTrendsAPI.analyze.mockResolvedValueOnce(googleTrendsMockData);

      const result = await api.getTrends(['common-topic']);

      // Should have one trend with averaged growth
      expect(result.trends).toHaveLength(1);
      
      // Should have one related topic with averaged correlation
      const related = result.related.find(r => r.name === 'common-related');
      expect(related).toBeDefined();
      expect(related?.correlation).toBeCloseTo(0.85); // Average of 0.8 and 0.9
    });

    it('should calculate seasonality correctly', async () => {
      const mockTrendData = [
        { date: '2023-01', value: 100 }, // Jan
        { date: '2023-06', value: 50 },  // Jun
        { date: '2023-12', value: 150 }, // Dec
      ];

      const semrushMockData = {
        'seasonal-topic': {
          search_volume: 1000,
          keyword_difficulty: 50,
          trend_data: mockTrendData,
          related_keywords: []
        }
      };

      mockSemrushAPI.analyzeKeywords.mockResolvedValueOnce(semrushMockData);
      mockGoogleTrendsAPI.analyze.mockResolvedValueOnce({
        query: 'seasonal-topic',
        interest_over_time: [],
        related_topics: [],
        related_queries: []
      });

      const result = await api.getTrends(['seasonal-topic']);

      const trend = result.trends[0];
      expect(trend.seasonality.peak).toContain('Dec');
      expect(trend.seasonality.low).toContain('Jun');
    });
  });
});
