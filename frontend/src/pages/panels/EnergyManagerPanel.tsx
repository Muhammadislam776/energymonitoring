import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { api } from '../../services/api';
import { EnergyOverview, Anomaly, Recommendation } from '../../types';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { EnergyFlowDiagram } from '../../components/energyflow/EnergyFlowDiagram';
import { DemandResponseSimulator } from '../../components/simulator/DemandResponseSimulator';
import {
  TrendingUp,
  Zap,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Leaf,
  DollarSign,
  ChevronRight,
  Clock,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  Activity,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Link } from 'react-router-dom';

export const EnergyManagerPanel: React.FC = () => {
  const { user } = useAuth();
  const { selectedBuildingId } = useTenant();
  const { liveData } = useWebSocket();

  const [overview, setOverview] = useState<EnergyOverview | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, an, rec, anData] = await Promise.all([
        api.getEnergyOverview(selectedBuildingId),
        api.getAnomalies({ buildingId: selectedBuildingId }),
        api.getRecommendations({ buildingId: selectedBuildingId }),
        api.getEnergyAnalytics({ buildingId: selectedBuildingId }),
      ]);
      setOverview(ov);
      setAnomalies(an);
      setRecommendations(rec);
      setAnalytics(anData);
    } catch (err) {
      console.error('Failed to load Energy Manager intelligence data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBuildingId]);

  const livePower = liveData?.buildingPower ? parseFloat(liveData.buildingPower.toFixed(1)) : (overview?.kpis.currentPower?.value || 428.6);

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 live-pulse-dot" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Analytics & AI Telemetry Desk
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            Energy Intelligence Center
            <Badge variant="blue" size="sm">
              Level-3 Analytics Desk
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous power load profiling, ML forecast models, AI behavioral anomaly validation & peak shedding
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Recalculate Models</span>
          </button>
        </div>
      </div>

      {/* Energy Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Instantaneous Demand"
          value={livePower.toString()}
          unit="kW"
          icon={Zap}
          delta="+3.4% vs Baseline"
          status={livePower > 550 ? 'warning' : 'healthy'}
        />
        <StatCard
          title="Peak Incomer Demand"
          value={overview?.kpis.peakDemand?.value?.toString() || '621.0'}
          unit="kW (Monthly Peak)"
          icon={TrendingUp}
          delta="Cap: 650 kW"
          status="normal"
        />
        <StatCard
          title="Monthly Carbon Footprint"
          value={overview?.kpis.carbonEmissions?.value?.toString() || '47.8'}
          unit="tCO₂e"
          icon={Leaf}
          delta="-4.2% carbon reduction"
          status="healthy"
        />
        <StatCard
          title="Verified Efficiency Index"
          value={`${overview?.kpis.efficiencyScore?.value || 84}/100`}
          unit="Performance Score"
          icon={Sparkles}
          delta="Rank: Top 15% Commercial"
          status="healthy"
        />
      </div>

      {/* Energy Flow Balance Matrix (Sankey-Style) */}
      <EnergyFlowDiagram solarKw={64.2} totalKw={livePower} />

      {/* Load Profile & Anomaly Evidence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Demand Profile */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Continuous Electrical Demand Profile</h3>
              <p className="text-xs text-slate-500">7-Day hourly load duration curve measured across all 24 sub-meters</p>
            </div>
            <Badge variant="blue" size="sm">Sub-station 400V</Badge>
          </div>

          <div className="h-64 w-full">
            {analytics?.trend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                  <Area
                    type="monotone"
                    dataKey="demandKw"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#energyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading curve...</div>
            )}
          </div>
        </div>

        {/* Right 1 Col: AI Anomaly Dossiers with Ground-Truth Evidence */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Anomaly Dossiers</h3>
                  <p className="text-xs text-slate-500">Continuous model validation</p>
                </div>
              </div>
              <Badge variant="danger" size="sm">{anomalies.length} Flagged</Badge>
            </div>

            <div className="space-y-3">
              {anomalies.slice(0, 3).map((an) => (
                <div
                  key={an.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{an.title}</span>
                    <Badge variant={an.severity === 'high' ? 'danger' : 'warning'} size="sm">
                      +{an.difference_pct}%
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{an.explanation}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>Measured: <strong>{an.measured_value} kW</strong></span>
                    <span>Expected: {an.expected_value} kW</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Model Confidence: <strong>94%</strong></span>
            <Link to="/anomalies" className="text-blue-600 font-bold flex items-center gap-1">
              Inspect Dossiers <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Automated Demand Response & Peak Shaving Simulator */}
      <DemandResponseSimulator />
    </div>
  );
};
