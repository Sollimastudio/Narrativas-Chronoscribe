import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsData } from '@/domain/narratives/workflow';

export class AnalyticsExporter {
  static async toExcel(data: AnalyticsData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Market Trends Sheet
    const trendsSheet = workbook.addWorksheet('Market Trends');
    trendsSheet.columns = [
      { header: 'Topic', key: 'topic' },
      { header: 'Growth', key: 'growth' },
      { header: 'Relevance', key: 'relevance' },
      { header: 'Peak Seasons', key: 'peak' },
      { header: 'Target Age Groups', key: 'age' },
      { header: 'Interests', key: 'interests' },
    ];

    data.marketTrends.trends.forEach(trend => {
      trendsSheet.addRow({
        topic: trend.topic,
        growth: trend.growth,
        relevance: trend.relevance,
        peak: trend.seasonality.peak.join(', '),
        age: trend.demographics.ageGroups.join(', '),
        interests: trend.demographics.interests.join(', '),
      });
    });

    // Content Insights Sheet
    const insightsSheet = workbook.addWorksheet('Content Insights');
    insightsSheet.columns = [
      { header: 'Metric', key: 'metric' },
      { header: 'Value', key: 'value' },
    ];

    insightsSheet.addRows([
      { metric: 'Emotional Score', value: data.contentInsights.emotionalScore },
      { metric: 'Viral Potential', value: data.contentInsights.viralPotential },
      { metric: 'Uniqueness Score', value: data.contentInsights.uniquenessScore },
      { metric: 'Controversy Level', value: data.contentInsights.controversyLevel },
      { metric: 'Readability Score', value: data.contentInsights.readability.score },
    ]);

    // Competitors Sheet
    const competitorsSheet = workbook.addWorksheet('Competitive Analysis');
    competitorsSheet.columns = [
      { header: 'Title', key: 'title' },
      { header: 'URL', key: 'url' },
      { header: 'Engagement', key: 'engagement' },
      { header: 'Shares', key: 'shares' },
      { header: 'Platform', key: 'platform' },
      { header: 'Format', key: 'format' },
    ];

    data.competitiveAnalysis.topPerformers.forEach(competitor => {
      competitorsSheet.addRow({
        title: competitor.title,
        url: competitor.url,
        engagement: competitor.engagement,
        shares: competitor.shareCount,
        platform: competitor.platform,
        format: competitor.format,
      });
    });

    // Format sheets for better readability
    [trendsSheet, insightsSheet, competitorsSheet].forEach(sheet => {
      sheet.columns.forEach(column => {
        column.width = 20;
      });
    });

    const buf: unknown = await (workbook.xlsx as any).writeBuffer();
    if (typeof Buffer !== 'undefined') {
      if (buf instanceof Uint8Array) return Buffer.from(buf);
      if (buf instanceof ArrayBuffer) return Buffer.from(buf);
    }
    // Fallback for environments/types
    return Buffer.from(new Uint8Array(buf as ArrayBuffer));
  }

  static async toPDF(data: AnalyticsData): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text('Content Analytics Report', 14, 15);

    // Market Trends
    doc.setFontSize(14);
    doc.text('Market Trends', 14, 25);
    
    const trendData = data.marketTrends.trends.map(trend => [
      trend.topic,
      trend.growth.toString(),
      trend.relevance.toString(),
      trend.seasonality.peak.join(', '),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Topic', 'Growth', 'Relevance', 'Peak Seasons']],
      body: trendData,
    });

    // Content Insights
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Content Insights', 14, 15);

    const insightData = [
      ['Emotional Score', data.contentInsights.emotionalScore.toString()],
      ['Viral Potential', data.contentInsights.viralPotential.toString()],
      ['Uniqueness Score', data.contentInsights.uniquenessScore.toString()],
      ['Controversy Level', data.contentInsights.controversyLevel.toString()],
    ];

    autoTable(doc, {
      startY: 20,
      head: [['Metric', 'Value']],
      body: insightData,
    });

    // Strategy Recommendations
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Strategy Recommendations', 14, 15);

    const strategyData = [
      ...data.strategyRecommendations.hooks.map(hook => ['Hook', hook]),
      ...data.strategyRecommendations.angles.map(angle => ['Angle', angle]),
      ...data.strategyRecommendations.distributionChannels.map(channel => ['Channel', channel]),
    ];

    autoTable(doc, {
      startY: 20,
      head: [['Type', 'Recommendation']],
      body: strategyData,
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  static async toCSV(data: AnalyticsData): Promise<string> {
    const lines: string[] = [];

    // Header
    lines.push('Content Analytics Report');
    lines.push('');

    // Market Trends
    lines.push('Market Trends');
    lines.push('Topic,Growth,Relevance,Peak Seasons,Target Age Groups,Interests');
    data.marketTrends.trends.forEach(trend => {
      lines.push([
        trend.topic,
        trend.growth,
        trend.relevance,
        trend.seasonality.peak.join('|'),
        trend.demographics.ageGroups.join('|'),
        trend.demographics.interests.join('|'),
      ].join(','));
    });
    lines.push('');

    // Content Insights
    lines.push('Content Insights');
    lines.push('Metric,Value');
    lines.push(`Emotional Score,${data.contentInsights.emotionalScore}`);
    lines.push(`Viral Potential,${data.contentInsights.viralPotential}`);
    lines.push(`Uniqueness Score,${data.contentInsights.uniquenessScore}`);
    lines.push(`Controversy Level,${data.contentInsights.controversyLevel}`);
    lines.push('');

    // Competitive Analysis
    lines.push('Competitive Analysis');
    lines.push('Title,URL,Engagement,Shares,Platform,Format');
    data.competitiveAnalysis.topPerformers.forEach(competitor => {
      lines.push([
        competitor.title,
        competitor.url,
        competitor.engagement,
        competitor.shareCount,
        competitor.platform,
        competitor.format,
      ].join(','));
    });

    return lines.join('\n');
  }
}
