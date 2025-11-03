import { describe, it, expect, vi } from 'vitest';
import { SemrushAPI } from '../server/analysis/apis/semrush';
import { GoogleTrendsAPI } from '../server/analysis/apis/google-trends';
import { StrategicAnalyzer } from '../server/ai/strategic-analyzer';
import { OpenAIProvider } from '../server/ai/openai-provider';

// Mock das APIs externas
vi.mock('../server/analysis/apis/semrush');
vi.mock('../server/analysis/apis/google-trends');
vi.mock('../server/ai/openai-provider');

describe('Strategic Analysis Integration', () => {
  const mockKeywords = ['content marketing', 'digital strategy'];
  const mockContent = 'Sample content for analysis';
  const mockFormat = 'blog';

  it('should integrate market trends data correctly', async () => {
    const analyzer = new StrategicAnalyzer();
    const result = await analyzer.analyzeContent(mockContent, mockFormat);

    expect(result.marketTrends).toBeDefined();
    expect(result.marketTrends.keywords).toHaveLength(mockKeywords.length);
    expect(result.marketTrends.volumes).toBeDefined();
    expect(result.marketTrends.trends).toBeInstanceOf(Array);
  });

  it('should integrate content insights data correctly', async () => {
    const analyzer = new StrategicAnalyzer();
    const result = await analyzer.analyzeContent(mockContent, mockFormat);

    expect(result.contentInsights).toBeDefined();
    expect(result.contentInsights.emotionalScore).toBeGreaterThanOrEqual(0);
    expect(result.contentInsights.emotionalScore).toBeLessThanOrEqual(1);
    expect(result.contentInsights.narrativeHooks).toBeInstanceOf(Array);
  });

  it('should integrate competitive analysis data correctly', async () => {
    const analyzer = new StrategicAnalyzer();
    const result = await analyzer.analyzeContent(mockContent, mockFormat);

    expect(result.competitiveAnalysis).toBeDefined();
    expect(result.competitiveAnalysis.topPerformers).toBeInstanceOf(Array);
    expect(result.competitiveAnalysis.gaps).toBeInstanceOf(Array);
  });

  it('should integrate audience insights data correctly', async () => {
    const analyzer = new StrategicAnalyzer();
    const result = await analyzer.analyzeContent(mockContent, mockFormat);

    expect(result.audienceInsights).toBeDefined();
    expect(result.audienceInsights.demographics).toBeDefined();
    expect(result.audienceInsights.psychographics).toBeDefined();
  });
});

describe('Strategic Analyzer Unit Tests', () => {
  it('should handle API errors gracefully', async () => {
    const analyzer = new StrategicAnalyzer();
    vi.spyOn(SemrushAPI.prototype, 'analyzeKeywords').mockRejectedValue(new Error('API Error'));

    await expect(analyzer.analyzeContent(mockContent, mockFormat)).resolves.toBeDefined();
  });

  it('should use fallback data when APIs are unavailable', async () => {
    const analyzer = new StrategicAnalyzer();
    vi.spyOn(GoogleTrendsAPI.prototype, 'getInterestOverTime').mockRejectedValue(new Error('API Error'));

    const result = await analyzer.analyzeContent(mockContent, mockFormat);
    expect(result.marketTrends).toBeDefined();
  });

  it('should optimize API calls for performance', async () => {
    const analyzer = new StrategicAnalyzer();
    const spy = vi.spyOn(OpenAIProvider.prototype, 'analyzeKeywords');

    await analyzer.analyzeContent(mockContent, mockFormat);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
