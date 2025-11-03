import React from 'react';
import { AnalyticsData } from '@/domain/narratives/workflow';
import { TrendChart, ContentInsightRadar, CompetitorChart, AudienceInsightChart } from './charts';

interface AnalyticsProps {
  data: AnalyticsData;
}

interface InsightCardProps {
  title: string;
  insights: string[];
  className?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, insights, className = "" }) => (
  <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    <ul className="space-y-2">
      {insights.map((insight, index) => (
        <li key={index} className="flex items-start">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm mr-3">
            {index + 1}
          </span>
          <span className="text-gray-600">{insight}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ data }) => {
  const related = Array.isArray(data.marketTrends.relatedTopics)
    ? data.marketTrends.relatedTopics
    : [] as any[];

  const relatedInsights = related.map((topic: any) => {
    if (typeof topic === 'string') return topic;
    if (topic && typeof topic === 'object') {
      const name = (topic as any).name ?? String(topic.topic ?? 'topic');
      const corr = (topic as any).correlation ?? 0;
      return `${name} (correlation: ${(Number(corr) * 100).toFixed(1)}%)`;
    }
    return String(topic);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Market Trends */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Market Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
            <TrendChart data={data.marketTrends.trends} />
          </div>
          <InsightCard
            title="Related Topics"
            insights={relatedInsights}
          />
        </div>
      </section>

      {/* Content Insights */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Content Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Content Metrics</h3>
            <ContentInsightRadar data={data.contentInsights} />
          </div>
          <div className="space-y-8">
            <InsightCard
              title="Narrative Hooks"
              insights={data.contentInsights.narrativeHooks}
            />
            <InsightCard
              title="SEO Insights"
              insights={[
                `Difficulty: ${data.contentInsights.seoMetrics.difficulty}/100`,
                `Competition: ${data.contentInsights.seoMetrics.competition}/100`,
                `Opportunity: ${data.contentInsights.seoMetrics.opportunity}/100`,
                `Recommended Length: ${data.contentInsights.seoMetrics.recommendedLength} words`
              ]}
            />
          </div>
        </div>
      </section>

      {/* Competitive Analysis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Competitive Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <CompetitorChart data={data.competitiveAnalysis.topPerformers} />
          </div>
          <div className="space-y-8">
            <InsightCard
              title="Market Gaps"
              insights={data.competitiveAnalysis.gaps}
            />
            <InsightCard
              title="Opportunities"
              insights={data.competitiveAnalysis.opportunities}
            />
          </div>
        </div>
      </section>

      {/* Audience Insights */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Audience Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Platform Engagement</h3>
            <AudienceInsightChart data={data.audienceInsights} />
          </div>
          <div className="space-y-8">
            <InsightCard
              title="Psychographics"
              insights={(() => {
                const ai: any = data.audienceInsights as any;
                const motivations: string[] = ai?.psychographics?.motivations || ai?.segments || [];
                const pains: string[] = ai?.psychographics?.painPoints || ai?.painPoints || [];
                return [
                  ...motivations.map((m: string) => `Motivation: ${m}`),
                  ...pains.map((p: string) => `Pain Point: ${p}`),
                ];
              })()}
            />
          </div>
        </div>
      </section>

      {/* Strategy Recommendations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Strategy Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <InsightCard
            title="Content Strategy"
            insights={[
              ...data.strategyRecommendations.hooks.map(h => `Hook: ${h}`),
              ...data.strategyRecommendations.angles.map(a => `Angle: ${a}`)
            ]}
          />
          <InsightCard
            title="Distribution Strategy"
            insights={[
              ...data.strategyRecommendations.distribution.primary.map(p => `Primary: ${p}`),
              ...data.strategyRecommendations.distribution.secondary.map(s => `Secondary: ${s}`)
            ]}
          />
          <InsightCard
            title="Timing Strategy"
            insights={[
              ...data.strategyRecommendations.timing.bestDays.map(d => `Best Day: ${d}`),
              ...data.strategyRecommendations.timing.bestTimes.map(t => `Best Time: ${t}`)
            ]}
          />
        </div>
      </section>
    </div>
  );
};
