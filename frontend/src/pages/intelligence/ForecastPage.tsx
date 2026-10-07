import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { ChartSkeleton } from '../../components/common/Skeleton';
import {
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  CloudSun,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const ForecastPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [range, setRange] = useState('24h');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getForecasts({ buildingId: selectedBuildingId, range });
        setData(res);
      } catch (err) {
        console.error('Failed to load forecasts', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedBuildingId, range]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Predictive AI Modeling
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Energy Consumption Forecasting
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hybrid LSTM Neural Network model projecting forward building load and peak tariffs
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: '24h', label: 'Next 24 Hours' },
            { id: '7d', label: 'Next 7 Days' },
            { id: '30d', label: 'Next 30 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === tab.id
                  ? 'bg-white text-blue-600 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Forecast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Predicted Tomorrow</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {data?.kpis.predictedTomorrowKwh?.toLocaleString() || '4,120'}
          </div>
          <span className="text-xs text-slate-500">kWh Expected Consumption</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Expected Peak</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900">
            {data?.kpis.expectedPeakKw || 648.0}
          </div>
          <span className="text-xs text-slate-500">kW Maximum Demand</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Peak Demand Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {data?.kpis.expectedPeakTime || '2:30 PM'}
          </div>
          <span className="text-xs text-slate-500">During peak tariff window</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Model Confidence</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {data?.kpis.forecastConfidence || 92.4}%
          </div>
          <span className="text-xs text-slate-500">95% Confidence Interval Band</span>
        </div>
      </div>

      {/* Actual vs Forecast Line Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Actual Measured vs Future Forecast</h3>
            <p className="text-xs text-slate-500">
              Clear distinction between verified telemetry (solid line) and AI projection (dashed line with bounds)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-blue-600 inline-block rounded" />
              <span>Measured Data (Actual kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-indigo-500 inline-block border-b border-dashed border-indigo-500" />
              <span>Forecast Data (Predicted kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-100 rounded inline-block border border-indigo-200" />
              <span>Confidence Range</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          {loading || !data?.chartSeries ? (
            <ChartSkeleton height="h-80" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartSeries}>
                <defs>
                  <linearGradient id="boundsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="url(#boundsGrad)" name="Upper Bound" />
                <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="transparent" name="Lower Bound" />
                <Line type="monotone" dataKey="actualKw" stroke="#2563eb" strokeWidth={3} dot={false} name="Measured Actual kW" />
                <Line type="monotone" dataKey="predictedKw" stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="Forecast Predicted kW" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Explaining Forecast Contributing Factors */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Forecast Factor Attribution & Weighting</h3>
        <p className="text-xs text-slate-500 mb-4">
          Machine learning inputs driving load profile predictions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.contributingFactors?.map((cf: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{cf.name}</span>
                <span className="text-xs font-mono font-bold text-blue-600">{cf.weight}%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{cf.desc}</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${cf.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
