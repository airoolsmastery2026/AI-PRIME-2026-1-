// src/components/DataVisualization.tsx
import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../i18n/useTranslation';

const AnalyticsCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = "" }) => (
    <div className={`hud-border p-4 ${className}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
            <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider mb-2 sm:mb-0">{title}</h3>
            {children[0]} 
        </div>
        {children[1]}
    </div>
);

const DataVizCustomBarTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-md">
        <p className="font-bold text-cyan-300">{label}</p>
        <p className="text-purple-300">{`${t('analytics.tooltipViews')}: ${new Intl.NumberFormat().format(payload[0].value)}`}</p>
        <p className="text-green-400">{`${t('analytics.tooltipRevenue')}: $${new Intl.NumberFormat().format(payload[1].value)}`}</p>
        <p className="text-yellow-400">{`${t('analytics.tooltipRPM')}: $${payload[2].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const DataVizCustomPieTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-md">
        <p className="font-bold text-cyan-300">{name}</p>
        <p className="text-green-400">{`${t('analytics.tooltipRevenue')}: $${new Intl.NumberFormat().format(value)}`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const safePercent = (Number(percent) || 0) * 100;

  if (safePercent < 5) return null; // Don't render label for very small slices

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${safePercent.toFixed(0)}%`}
    </text>
  );
};


interface DataPoint {
  name: string;
  views: number;
  revenue: number;
  rpm: number;
  [key: string]: string | number;
}

interface DataVisualizationProps {
  data: DataPoint[];
  title: string;
  className?: string;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data, title, className }) => {
    const { t } = useTranslation();
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
    const PIE_COLORS = ['#8b5cf6', '#34d399', '#facc15', '#60a5fa', '#f87171'];

    return (
        <AnalyticsCard title={title} className={className}>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${chartType === 'bar' ? 'bg-purple-600/80 text-white' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-400'}`}
                >
                    {t('analytics.chartTypeBar')}
                </button>
                 <button
                    onClick={() => setChartType('pie')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${chartType === 'pie' ? 'bg-purple-600/80 text-white' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-400'}`}
                >
                   {t('analytics.chartTypePie')}
                </button>
            </div>
            <div className="w-full h-80">
                {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis yAxisId="left" orientation="left" stroke="#a78bfa" tick={{ fill: '#a78bfa' }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                            <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fill: '#34d399' }} tickFormatter={(value) => `$${Math.round(value as number)}`} />
                            <Tooltip content={<DataVizCustomBarTooltip />} cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}/>
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar yAxisId="left" dataKey="views" fill="#8b5cf6" name={t('analytics.legendViews')} />
                            <Bar yAxisId="right" dataKey="revenue" fill="#34d399" name={t('analytics.legendRevenue')} />
                            <Bar yAxisId="right" dataKey="rpm" fill="#facc15" name={t('analytics.legendRPM')} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={data}
                                dataKey="revenue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                labelLine={false}
                                label={renderCustomizedLabel}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<DataVizCustomPieTooltip />} />
                            <Legend formatter={(value) => <span className="text-gray-300">{value}</span>}/>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </AnalyticsCard>
    );
};