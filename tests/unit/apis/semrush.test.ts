import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SemrushAPI } from '@/server/analysis/apis/semrush';
import { env } from '@/config/env';

vi.mock('@/config/env', () => ({
  env: {
    analytics: {
      semrush: {
        apiKey: 'test-api-key',
        endpoint: 'https://api.semrush.com'
      }
    }
  }
}));

describe('SemrushAPI', () => {
  let api: SemrushAPI;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
    api = new SemrushAPI();
  });

  describe('analyzeKeywords', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        'test-keyword': {
          keyword: 'test-keyword',
          search_volume: 1000,
          keyword_difficulty: 45,
          cpc: 1.5,
          competitive_density: 0.8,
          intent: 'commercial',
          trend_data: [
            { date: '2023-01', value: 900 },
            { date: '2023-02', value: 1100 }
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.analyzeKeywords(['test-keyword']);
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.semrush.com/analytics/v1/keywords',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ keywords: ['test-keyword'] })
        }
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Rate limit exceeded'
      });

      const result = await api.analyzeKeywords(['test-keyword']);
      
      expect(result).toEqual({});
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await api.analyzeKeywords(['test-keyword']);
      
      expect(result).toEqual({});
    });
  });

  describe('getTrendingTopics', () => {
    it('should handle successful API response', async () => {
      const mockResponse = [
        {
          topic: 'trending-topic',
          growth: 150,
          volume: 5000,
          difficulty: 65
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getTrendingTopics('technology');
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.semrush.com/trends/industry/technology',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Invalid industry'
      });

      const result = await api.getTrendingTopics('invalid');
      
      expect(result).toEqual([]);
    });
  });

  describe('getCompetitorInsights', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        traffic: 100000,
        keywords: 5000,
        competitors: [
          {
            domain: 'competitor.com',
            commonKeywords: 1500,
            traffic: 80000
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getCompetitorInsights('example.com');
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.semrush.com/analytics/v1/domains/example.com/competitors',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Domain not found'
      });

      const result = await api.getCompetitorInsights('invalid.com');
      
      expect(result).toEqual({
        traffic: 0,
        keywords: 0,
        competitors: []
      });
    });
  });
});
