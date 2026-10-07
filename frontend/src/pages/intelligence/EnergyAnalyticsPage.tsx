import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { ChartSkeleton } from '../../components/common/Skeleton';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Zap,
  Layers,
  Cpu,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const EnergyAnalyticsPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [range, setRange] = useState('7d');
  const [granularity, setGranularity] = useState('daily');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getEnergyAnalytics({
          buildingId: selectedBuildingId,
          range,
          granularity,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedBuildingId, range, granularity]);

  const COLORS = ['#2563eb', '#38bdf8', '#818cf8', '#a855f7', '#94a3b8', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Intelligence Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Energy Analytics & Demand Profiler
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-dimensional time-series consumption analysis and peak power profiling
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-2">
          {/* Range */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: 'Quarter' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  range === t.id
                    ? 'bg-white text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Granularity */}
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="hourly">Hourly Granularity</option>
            <option value="daily">Daily Granularity</option>
          </select>
        </div>
      </div>

      {/* Row 1: Consumption Trend (kWh) & Peak Power Demand (kW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Trend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Total Consumption Trend (kWh)</h3>
              <p className="text-xs text-slate-500">Integrated energy usage over elapsed intervals</p>
            </div>
            <span className="text-xs font-bold font-mono text-blue-600">kWh</span>
          </div>

          <div className="h-72 w-full">
            {loading || !data?.trend ? (
              <ChartSkeleton height="h-72" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="kwhGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kWh" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="kwh" stroke="#2563eb" strokeWidth={2.5} fill="url(#kwhGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Peak Demand (kW) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Peak Power Demand (kW)</h3>
              <p className="text-xs text-slate-500">Maximum instantaneous draw vs demand threshold</p>
            </div>
            <span className="text-xs font-bold font-mono text-amber-600">Max: 621 kW</span>
          </div>

          <div className="h-72 w-full">
            {loading || !data?.trend ? (
              <ChartSkeleton height="h-72" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
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
                  <Line type="monotone" dataKey="demandKw" stroke="#3b82f6" strokeWidth={2} dot={false} name="Average kW" />
                  <Line type="monotone" dataKey="peakKw" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Peak kW" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Energy by Floor & Energy by Room */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Energy Consumption by Floor</h3>
              <p className="text-xs text-slate-500">Active power load across all 6 building levels</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading || !data?.floorBreakdown ? (
              <ChartSkeleton height="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.floorBreakdown}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                  <Bar dataKey="consumptionKw" fill="#2563eb" radius={[4, 4, 0, 0]} name="Power (kW)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 8 Rooms Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top 8 Energy Consuming Zones</h3>
              <p className="text-xs text-slate-500">Highest active draw room clusters</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading || !data?.roomBreakdown ? (
              <ChartSkeleton height="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.roomBreakdown} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} unit=" kW" />
                  <YAxis type="category" dataKey="room" stroke="#94a3b8" fontSize={9} tickLine={false} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="kw" fill="#0284c7" radius={[0, 4, 4, 0]} name="Power (kW)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
