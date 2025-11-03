import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { AnalyticsData } from '@/domain/narratives/workflow';

interface TrendChartProps {
  data: AnalyticsData['marketTrends']['trends'];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="topic" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="growth" stroke="#3b82f6" fill="#93c5fd" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

interface ContentInsightProps {
  data: AnalyticsData['contentInsights'];
}

export const ContentInsightRadar: React.FC<ContentInsightProps> = ({ data }) => {
  const chartData = [
    { metric: 'Emotional Score', value: data.emotionalScore },
    { metric: 'Viral Potential', value: data.viralPotential },
    { metric: 'Uniqueness', value: data.uniquenessScore },
    { metric: 'Controversy', value: data.controversyLevel },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis domain={[0, 1]} />
          <Radar dataKey="value" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CompetitorChartProps {
  data: AnalyticsData['competitiveAnalysis']['topPerformers'];
}

export const CompetitorChart: React.FC<CompetitorChartProps> = ({ data }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="engagement" fill="#3b82f6" />
        <Bar dataKey="shareCount" fill="#93c5fd" />
      </BarChart>
    </ResponsiveContainer>
    </div>
);

interface AudienceInsightProps {
  data: AnalyticsData['audienceInsights'] | any;
}

export const AudienceInsightChart: React.FC<AudienceInsightProps> = ({ data }) => {
  // compat: se vier no formato novo (segments/preferences/behaviors/painPoints)
  let platformData: Array<{ platform: string; value: number }> = [];
  if (data?.engajamento?.plataformas) {
    platformData = Object.entries(data.engajamento.plataformas).map(([platform, value]) => ({
      platform,
      value: Number(value)
    }));
  } else if (data?.platforms) {
    platformData = Object.entries(data.platforms).map(([platform, value]) => ({ platform, value: Number(value) }));
  } else if (Array.isArray(data?.preferences)) {
    platformData = data.preferences.slice(0, 5).map((p: string, i: number) => ({ platform: p, value: 1 }));
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={platformData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="platform" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
