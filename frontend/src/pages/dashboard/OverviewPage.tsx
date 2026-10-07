import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { EnergyOverview, Anomaly, Recommendation, Alert } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton, ChartSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Badge } from '../../components/common/Badge';
import {
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  DollarSign,
  Leaf,
  Sparkles,
  Bell,
  ArrowRight,
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronRight,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { EnergyFlowDiagram } from '../../components/energyflow/EnergyFlowDiagram';
import { DemandResponseSimulator } from '../../components/simulator/DemandResponseSimulator';
import { CloudSun, Clock, Wind } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { liveData } = useWebSocket();
  const { selectedBuildingId, selectedBuilding } = useTenant();
  const navigate = useNavigate();

  const [data, setData] = useState<EnergyOverview | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, an, anoms, recs, alts] = await Promise.all([
        api.getEnergyOverview(selectedBuildingId),
        api.getEnergyAnalytics({ buildingId: selectedBuildingId, range: '7d' }),
        api.getAnomalies({ buildingId: selectedBuildingId }),
        api.getRecommendations({ buildingId: selectedBuildingId }),
        api.getAlerts({ buildingId: selectedBuildingId, status: 'new' }),
      ]);
      setData(ov);
      setAnalytics(an);
      setAnomalies(anoms.slice(0, 3));
      setRecommendations(recs.slice(0, 2));
      setAlerts(alts.slice(0, 4));
    } catch (err: any) {
      console.error('Failed to load dashboard overview', err);
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBuildingId]);

  if (error) {
    return <ErrorState onRetry={fetchData} message={error} />;
  }

  // Use live WebSocket power when streaming
  const currentPowerValue = liveData?.buildingPower ?? data?.kpis.currentPower.value ?? 428.6;

  const COLORS = ['#2563eb', '#38bdf8', '#818cf8', '#a855f7', '#94a3b8'];

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Executive Digital Twin Dashboard
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {selectedBuilding?.name || 'EnergyTwin Tower'}
            <Badge variant="healthy" size="sm" pulse>
              Live Telemetry
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedBuilding?.address || '100 Innovation Boulevard'} • {selectedBuilding?.floors_count || 6} Floors • {selectedBuilding?.area?.toLocaleString() || '38,500'} m²
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/digital-twin"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-blue-500/20"
          >
            <span>Launch 3D Twin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/live-monitoring"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <span>Sub-second Grid</span>
          </Link>
        </div>
      </div>

      {/* 8 Top KPI Cards */}
      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Power"
            value={currentPowerValue.toFixed(1)}
            unit="kW"
            icon={Zap}
            delta={data.kpis.currentPower.delta}
            isPositiveGood={data.kpis.currentPower.isPositiveGood}
            status={data.kpis.currentPower.status}
            comparisonText="vs 24h average"
            sparkline={data.kpis.currentPower.sparkline}
            isLive
          />

          <StatCard
            title="Today's Consumption"
            value={data.kpis.todayConsumption.value.toLocaleString()}
            unit="kWh"
            icon={Activity}
            delta={data.kpis.todayConsumption.delta}
            isPositiveGood={data.kpis.todayConsumption.isPositiveGood}
            status={data.kpis.todayConsumption.status}
            comparisonText="vs yesterday same time"
            sparkline={data.kpis.todayConsumption.sparkline}
          />

          <StatCard
            title="Monthly Consumption"
            value={data.kpis.monthlyConsumption.value}
            unit="MWh"
            icon={BarChart3}
            delta={data.kpis.monthlyConsumption.delta}
            isPositiveGood={data.kpis.monthlyConsumption.isPositiveGood}
            status={data.kpis.monthlyConsumption.status}
            comparisonText="vs last month"
            sparkline={data.kpis.monthlyConsumption.sparkline}
          />

          <StatCard
            title="Peak Demand"
            value={data.kpis.peakDemand.value}
            unit="kW"
            icon={TrendingUp}
            delta={data.kpis.peakDemand.delta}
            isPositiveGood={data.kpis.peakDemand.isPositiveGood}
            status={data.kpis.peakDemand.status}
            comparisonText="Threshold: 650 kW"
            sparkline={data.kpis.peakDemand.sparkline}
          />

          <StatCard
            title="Estimated Cost"
            value={`$${data.kpis.estimatedCost.value.toLocaleString()}`}
            icon={DollarSign}
            delta={data.kpis.estimatedCost.delta}
            isPositiveGood={data.kpis.estimatedCost.isPositiveGood}
            status={data.kpis.estimatedCost.status}
            comparisonText="at $0.16/kWh blended"
            sparkline={data.kpis.estimatedCost.sparkline}
          />

          <StatCard
            title="Carbon Emissions"
            value={data.kpis.carbonEmissions.value}
            unit="tCO₂e"
            icon={Leaf}
            delta={data.kpis.carbonEmissions.delta}
            isPositiveGood={data.kpis.carbonEmissions.isPositiveGood}
            status={data.kpis.carbonEmissions.status}
            comparisonText="Grid: 0.42 kg/kWh"
            sparkline={data.kpis.carbonEmissions.sparkline}
          />

          <StatCard
            title="Efficiency Score"
            value={data.kpis.efficiencyScore.value}
            unit="/100"
            icon={Sparkles}
            delta={data.kpis.efficiencyScore.delta}
            isPositiveGood={data.kpis.efficiencyScore.isPositiveGood}
            status={data.kpis.efficiencyScore.status}
            comparisonText="Tier 1 High Performance"
            sparkline={data.kpis.efficiencyScore.sparkline}
          />

          <StatCard
            title="Active Alerts"
            value={alerts.length || data.kpis.activeAlerts.value}
            icon={Bell}
            delta={data.kpis.activeAlerts.delta}
            isPositiveGood={data.kpis.activeAlerts.isPositiveGood}
            status={alerts.length > 5 ? 'critical' : 'warning'}
            comparisonText="Require operator action"
            sparkline={data.kpis.activeAlerts.sparkline}
          />
        </div>
      )}

      {/* Real-Based Environmental & Time-of-Use (ToU) Live Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time of Use Tariff */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" /> Time-of-Use Tariff Tier
            </span>
            <div className="text-lg font-bold font-mono mt-0.5">On-Peak ($0.24 / kWh)</div>
            <span className="text-[10px] text-blue-200">Window: 14:00 - 18:00 • Off-Peak at 20:00</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-mono font-bold text-xs text-blue-300">
            ToU
          </div>
        </div>

        {/* Demand Surcharge Safety Buffer */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Peak Demand Safety Buffer
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">29.0 kW Margin</div>
            <span className="text-[10px] text-slate-400">Peak 621 kW / 650 kW Limit ($14.50/kW penalty)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-mono font-bold text-xs text-amber-600">
            95%
          </div>
        </div>

        {/* Ambient Weather Station */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1">
              <CloudSun className="w-3 h-3 text-sky-500" /> Weather & Solar Irradiance
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">26.4°C • 780 W/m²</div>
            <span className="text-[10px] text-slate-400">Clear Sky • 52% RH • 4.2 Cooling Degree Days</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs">
            PV
          </div>
        </div>

        {/* Indoor Air Quality (IEQ) */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Wind className="w-3 h-3 text-emerald-500" /> Indoor Air Quality (IEQ)
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">540 ppm CO₂</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Optimal Airflow • PM2.5: 8.4 µg/m³</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xs">
            AQI
          </div>
        </div>
      </div>

      {/* Interactive Power Balance (Sankey Matrix) */}
      <EnergyFlowDiagram
        gridKw={Math.max(0, currentPowerValue - 64.2)}
        solarKw={64.2}
        totalKw={currentPowerValue}
      />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Consumption & Power Demand Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Building Power Demand & Energy Profile</h3>
              <p className="text-xs text-slate-500">Continuous 7-day load curve measured at Main Incomer</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Power Demand (kW)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {analytics?.trend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
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
                    fillOpacity={1}
                    fill="url(#powerGrad)"
                    name="Demand (kW)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton height="h-72" />
            )}
          </div>
        </div>

        {/* Right 1 Col: Energy Distribution by System (Donut Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Load Distribution by System</h3>
            <p className="text-xs text-slate-500">Live breakdown of active electrical draw</p>
          </div>

          <div className="h-56 w-full">
            {analytics?.equipmentDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.equipmentDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.equipmentDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton height="h-56" />
            )}
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {analytics?.equipmentDistribution?.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto font-mono">{item.value} kW</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floor Breakdown & AI Anomalies & Recommendations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Energy by Floor (Bar Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Floor Consumption vs Target</h3>
              <p className="text-xs text-slate-500">kW draw comparison across building floors</p>
            </div>
            <Link to="/floors-rooms" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="h-64 w-full">
            {analytics?.floorBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.floorBreakdown}>
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
                  <Bar dataKey="consumptionKw" fill="#2563eb" radius={[4, 4, 0, 0]} name="Current kW" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton height="h-64" />
            )}
          </div>
        </div>

        {/* Center: AI Anomalies Panel with Evidence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Detected Anomalies</h3>
                  <p className="text-xs text-slate-500">Continuous AI behavioral validation</p>
                </div>
              </div>
              <Link to="/anomalies" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                All ({anomalies.length})
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {anomalies.length > 0 ? (
                anomalies.map((an) => (
                  <div
                    key={an.id}
                    onClick={() => navigate('/anomalies')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        {an.title}
                      </span>
                      <Badge variant={an.severity === 'high' ? 'danger' : 'warning'} size="sm">
                        {an.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span>Measured: <strong>{an.measured_value} kW</strong> (Expected: {an.expected_value} kW)</span>
                      <span className="font-bold text-rose-600 font-mono">+{an.difference_pct}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center">No active anomalies detected</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Model Confidence: <strong>94%</strong></span>
            <Link to="/anomalies" className="text-blue-600 font-semibold flex items-center gap-1">
              Inspect Evidence <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: AI Efficiency Recommendations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Efficiency Recommendations</h3>
                  <p className="text-xs text-slate-500">Backed by measured platform evidence</p>
                </div>
              </div>
              <Link to="/recommendations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate('/recommendations')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-emerald-50/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      +${rec.monthly_saving_usd.toLocaleString()}/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{rec.description}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>Potential Saving: <strong>{rec.potential_saving_pct}%</strong></span>
                    <span>Confidence: <strong>{rec.confidence}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total verified savings pipeline:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">$3,740 / month</span>
          </div>
        </div>
      </div>

      {/* Automated Demand Response & Peak Shaving Simulator */}
      <DemandResponseSimulator />
    </div>
  );
};
