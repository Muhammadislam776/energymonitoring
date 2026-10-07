import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  delta?: string;
  isPositiveGood?: boolean;
  status?: 'normal' | 'healthy' | 'warning' | 'critical';
  comparisonText?: string;
  sparkline?: number[];
  isLive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  delta,
  isPositiveGood = true,
  status = 'normal',
  comparisonText = 'vs previous period',
  sparkline,
  isLive = false,
}) => {
  const isUp = delta?.startsWith('+');
  const isDown = delta?.startsWith('-');

  // Good/Bad calculation for energy (usually negative delta is good for energy consumption!)
  const isGood = isPositiveGood ? isUp : isDown;
  const isBad = isPositiveGood ? isDown : isUp;

  const statusBorderColors = {
    healthy: 'hover:border-emerald-300',
    warning: 'hover:border-amber-300',
    critical: 'hover:border-rose-300',
    normal: 'hover:border-blue-300',
  };

  const chartData = sparkline ? sparkline.map((val, idx) => ({ i: idx, val })) : [];
  const lineColor = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : status === 'critical' ? '#ef4444' : '#3b82f6';

  return (
    <div className={`relative bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 group ${statusBorderColors[status]}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-pulse-dot" />
              LIVE
            </span>
          )}
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Value & Unit */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-500">
            {unit}
          </span>
        )}
      </div>

      {/* Sparkline & Comparison Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
        {delta ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`flex items-center font-semibold px-1.5 py-0.5 rounded ${
                isGood
                  ? 'text-emerald-700 bg-emerald-50'
                  : isBad
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : isDown ? (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              ) : (
                <Minus className="w-3 h-3 mr-0.5" />
              )}
              {delta}
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-[110px]">
              {comparisonText}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">{comparisonText}</span>
        )}

        {/* Small Sparkline */}
        {chartData.length > 0 && (
          <div className="w-20 h-7 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
