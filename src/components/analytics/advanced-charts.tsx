import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sankey,
  Treemap,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Legend,
} from 'recharts';
import { AnalyticsData } from '@/domain/narratives/workflow';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DemographicsPieProps {
  data: Record<string, number>;
  title: string;
}

export const DemographicsPie: React.FC<DemographicsPieProps> = ({ data, title }) => {
  const pieData = Object.entries(data).map(([name, value]) => ({
    name,
    value: value * 100 // Convert to percentage
  }));

  return (
    <div className="h-64 w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ContentJourneyProps {
  data: AnalyticsData['contentInsights'];
}

export const ContentJourney: React.FC<ContentJourneyProps> = ({ data }) => {
  const journeyData = [
    {
      nodes: [
        { name: 'Discovery' },
        { name: 'Engagement' },
        { name: 'Action' },
        { name: 'Sharing' }
      ],
      links: [
        {
          source: 0,
          target: 1,
          value: data.viralPotential * 100,
        },
        {
          source: 1,
          target: 2,
          value: data.emotionalScore * 100,
        },
        {
          source: 2,
          target: 3,
          value: data.uniquenessScore * 100,
        },
      ],
    },
  ];

  return (
    <div className="h-64 w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">Content Journey</h3>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={journeyData[0]}
          nodePadding={50}
          nodeWidth={10}
          link={{ stroke: '#77c878' }}
        />
      </ResponsiveContainer>
    </div>
  );
};

interface TopicTreeMapProps {
  data: AnalyticsData['marketTrends'];
}

export const TopicTreeMap: React.FC<TopicTreeMapProps> = ({ data }) => {
  const treeData = data.trends.map(trend => ({
    name: trend.topic,
    size: trend.growth * trend.relevance * 1000,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  return (
    <div className="h-64 w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">Topic Relevance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="size"
          stroke="#fff"
          fill="#8884d8"
          content={({ root, depth }) => (
            <g>
              {root.children?.map((node: any, index: number) => (
                <g key={index}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    fill={node.color}
                    stroke="#fff"
                  />
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                  >
                    {node.name}
                  </text>
                </g>
              ))}
            </g>
          )}
        />
      </ResponsiveContainer>
    </div>
  );
};

interface CompetitiveMatrixProps {
  data: AnalyticsData['competitiveAnalysis'];
}

export const CompetitiveMatrix: React.FC<CompetitiveMatrixProps> = ({ data }) => {
  const matrixData = data.topPerformers.map(performer => ({
    name: performer.title,
    engagement: performer.engagement,
    shares: performer.shareCount,
    z: 1,
  }));

  return (
    <div className="h-64 w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">Competitive Matrix</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="engagement" name="Engagement" />
          <YAxis type="number" dataKey="shares" name="Shares" />
          <ZAxis type="number" dataKey="z" range={[100, 500]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name="Competitors"
            data={matrixData}
            fill="#8884d8"
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
