import { NextRequest } from 'next/server';
import { StrategicAnalyzer } from '@/server/ai/strategic-analyzer';
import { AnalyticsExporter } from '@/server/export/analytics';
import { AnalyticsCache } from '@/server/cache/analytics';
import { AnalyticsData } from '@/domain/narratives/workflow';
import { OpenAIProvider } from '@/server/ai/openai-provider';
import { MarketTrendsAPI } from '@/server/analysis/market-trends';
import { CompetitiveAnalyzer } from '@/server/analysis/competitive';
import { AudienceInsightService } from '@/server/analysis/audience';

// Lazy initialization
let analyzerInstance: StrategicAnalyzer | null = null;

function getAnalyzer() {
  if (!analyzerInstance) {
    analyzerInstance = new StrategicAnalyzer(
      new OpenAIProvider(),
      new MarketTrendsAPI(),
      new CompetitiveAnalyzer(),
      new AudienceInsightService()
    );
  }
  return analyzerInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { content, format, exportType, topic = 'general' } = await req.json();
    const analyzer = getAnalyzer();

    if (!content || typeof content !== 'string') {
      return Response.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    if (!format || typeof format !== 'string') {
      return Response.json(
        { error: 'Format is required and must be a string' },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedAnalysis = await AnalyticsCache.get(content, format);
    let analysis: AnalyticsData;

    if (!cachedAnalysis) {
      // Perform new analysis if not cached
      const rawAnalysis = await analyzer.analyzeContent(content, topic, format);
      analysis = rawAnalysis;
      // Cache the results
      await AnalyticsCache.set(content, format, analysis);
    } else {
      analysis = cachedAnalysis;
    }

    // Handle different export formats
    if (exportType) {
      if (!['excel', 'pdf', 'csv'].includes(exportType)) {
        return Response.json(
          { error: 'Invalid export type. Must be one of: excel, pdf, csv' },
          { status: 400 }
        );
      }

      let exportedData: Buffer | string;
      let contentType: string;
      let filename: string;

      switch (exportType) {
        case 'excel':
          exportedData = await AnalyticsExporter.toExcel(analysis);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = 'analytics-report.xlsx';
          break;

        case 'pdf':
          exportedData = await AnalyticsExporter.toPDF(analysis);
          contentType = 'application/pdf';
          filename = 'analytics-report.pdf';
          break;

        case 'csv':
          exportedData = await AnalyticsExporter.toCSV(analysis);
          contentType = 'text/csv';
          filename = 'analytics-report.csv';
          break;

        default:
          throw new Error(`Unsupported export type: ${exportType}`);
      }

      // Return exported file
      return new Response(exportedData as any, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Return analysis results
    return Response.json(analysis);
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json(
      { error: 'Failed to process analytics request' },
      { status: 500 }
    );
  }
}
